import {
  ALERT_DECISIONS,
  INBOX_SCHEMA,
  indicatorAlertFingerprint,
  parseIndicatorAlert
} from "../../shared/alert-contract.mjs";

const WORKER_VERSION = "0.1.0";
const DEFAULT_RETENTION_DAYS = 30;
const MAX_RETENTION_DAYS = 365;
const MAX_BODY_BYTES = 32768;
const MAX_LIST_LIMIT = 100;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers
    }
  });
}

function parseAllowedOrigins(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function requestOriginAllowed(request, env) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return parseAllowedOrigins(env.ALLOWED_ORIGINS).includes(origin);
}

function corsHeaders(request, env) {
  const origin = request.headers.get("origin");
  if (!origin || !requestOriginAllowed(request, env)) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-headers": "authorization, content-type",
    "access-control-allow-methods": "GET, PATCH, DELETE, OPTIONS",
    "access-control-max-age": "86400",
    vary: "Origin"
  };
}

function secureEqual(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  let mismatch = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    mismatch |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

function validSecret(value) {
  const secret = String(value || "");
  return secret.length >= 32 && secret.length <= 512;
}

function authenticationReady(env) {
  return (
    validSecret(env.TRADINGVIEW_WEBHOOK_TOKEN) &&
    validSecret(env.SYNC_API_TOKEN) &&
    !secureEqual(env.TRADINGVIEW_WEBHOOK_TOKEN, env.SYNC_API_TOKEN)
  );
}

function bearerToken(request) {
  const value = request.headers.get("authorization") || "";
  return value.startsWith("Bearer ") ? value.slice(7).trim() : "";
}

function retentionDays(env) {
  const value = Number(env.RETENTION_DAYS);
  if (!Number.isInteger(value) || value < 1) return DEFAULT_RETENTION_DAYS;
  return Math.min(value, MAX_RETENTION_DAYS);
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function parseLimit(value) {
  const limit = Number(value);
  if (!Number.isInteger(limit) || limit < 1) return 50;
  return Math.min(limit, MAX_LIST_LIMIT);
}

function parseSince(value) {
  const since = Number(value);
  return Number.isSafeInteger(since) && since > 0 ? since : 0;
}

async function scheduleCleanup(store, env, context, now) {
  const cutoff = now - retentionDays(env) * 24 * 60 * 60 * 1000;
  const task = store.cleanup(cutoff);
  if (context && typeof context.waitUntil === "function") {
    context.waitUntil(task);
    return;
  }
  await task;
}

export function createD1AlertStore(db) {
  return {
    async upsert(record) {
      await db.prepare(`
        INSERT INTO indicator_alerts (
          id, fingerprint, payload, decision, received_at, updated_at
        ) VALUES (?1, ?2, ?3, 'new', ?4, ?5)
        ON CONFLICT(id) DO UPDATE SET
          payload = excluded.payload,
          updated_at = excluded.updated_at
      `).bind(
        record.id,
        record.fingerprint,
        JSON.stringify(record.payload),
        record.receivedAt,
        record.updatedAt
      ).run();
      return this.get(record.id);
    },

    async get(id) {
      const row = await db.prepare(`
        SELECT id, payload, decision, received_at, updated_at, deleted_at
        FROM indicator_alerts
        WHERE id = ?1
      `).bind(id).first();
      return row ? mapD1Row(row) : null;
    },

    async list({ since, limit }) {
      const result = await db.prepare(`
        SELECT id, payload, decision, received_at, updated_at, deleted_at
        FROM indicator_alerts
        WHERE updated_at >= ?1
        ORDER BY updated_at DESC, received_at DESC
        LIMIT ?2
      `).bind(since, limit).run();
      return (result.results || []).map(mapD1Row);
    },

    async updateDecision(id, decision, now) {
      const result = await db.prepare(`
        UPDATE indicator_alerts
        SET decision = ?1, updated_at = ?2
        WHERE id = ?3 AND deleted_at IS NULL
      `).bind(decision, now, id).run();
      if (!result.meta || result.meta.changes < 1) return null;
      return this.get(id);
    },

    async softDelete(id, now) {
      const result = await db.prepare(`
        UPDATE indicator_alerts
        SET deleted_at = ?1, updated_at = ?1
        WHERE id = ?2 AND deleted_at IS NULL
      `).bind(now, id).run();
      if (!result.meta || result.meta.changes < 1) return null;
      return this.get(id);
    },

    async cleanup(cutoff) {
      await db.prepare(`
        DELETE FROM indicator_alerts
        WHERE updated_at < ?1
      `).bind(cutoff).run();
    }
  };
}

function mapD1Row(row) {
  let payload = {};
  try {
    payload = JSON.parse(row.payload);
  } catch (error) {
    payload = {};
  }
  return {
    id: row.id,
    payload,
    decision: row.decision,
    receivedAt: Number(row.received_at),
    updatedAt: Number(row.updated_at),
    deleted: row.deleted_at !== null && row.deleted_at !== undefined,
    deletedAt: row.deleted_at === null || row.deleted_at === undefined ?
      null : Number(row.deleted_at)
  };
}

async function readJsonBody(request) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error("INVALID_JSON");
  }
}

async function handleWebhook(request, env, store, context, token) {
  if (
    !env.TRADINGVIEW_WEBHOOK_TOKEN ||
    !secureEqual(token, env.TRADINGVIEW_WEBHOOK_TOKEN)
  ) {
    return json({ ok: false, error: "not_found" }, 404);
  }
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return json({ ok: false, error: "content_type_must_be_json" }, 415);
  }

  let source;
  try {
    source = await readJsonBody(request);
  } catch (error) {
    const status = error.message === "PAYLOAD_TOO_LARGE" ? 413 : 400;
    return json({ ok: false, error: error.message.toLowerCase() }, status);
  }

  let payload;
  try {
    payload = parseIndicatorAlert(source);
  } catch (error) {
    return json({ ok: false, error: "invalid_alert", message: error.message }, 422);
  }

  const fingerprint = indicatorAlertFingerprint(payload);
  const id = await sha256(fingerprint);
  const now = Date.now();
  const alert = await store.upsert({
    id,
    fingerprint,
    payload,
    receivedAt: now,
    updatedAt: now
  });
  await scheduleCleanup(store, env, context, now);
  return json({ ok: true, duplicateKey: id, alert }, 202);
}

async function handleList(request, env, store, context) {
  const url = new URL(request.url);
  const now = Date.now();
  const alerts = await store.list({
    since: parseSince(url.searchParams.get("since")),
    limit: parseLimit(url.searchParams.get("limit"))
  });
  await scheduleCleanup(store, env, context, now);
  return json({
    schema: INBOX_SCHEMA,
    retentionDays: retentionDays(env),
    serverTime: now,
    alerts
  }, 200, corsHeaders(request, env));
}

async function handleDecision(request, env, store, id) {
  let body;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    return json(
      { ok: false, error: error.message.toLowerCase() },
      error.message === "PAYLOAD_TOO_LARGE" ? 413 : 400,
      corsHeaders(request, env)
    );
  }
  if (!body || !ALERT_DECISIONS.includes(body.decision)) {
    return json(
      { ok: false, error: "invalid_decision" },
      422,
      corsHeaders(request, env)
    );
  }
  const alert = await store.updateDecision(id, body.decision, Date.now());
  if (!alert) {
    return json({ ok: false, error: "not_found" }, 404, corsHeaders(request, env));
  }
  return json({ ok: true, alert }, 200, corsHeaders(request, env));
}

async function handleDelete(request, env, store, id) {
  const alert = await store.softDelete(id, Date.now());
  if (!alert) {
    return json({ ok: false, error: "not_found" }, 404, corsHeaders(request, env));
  }
  return json({ ok: true, alert }, 200, corsHeaders(request, env));
}

export async function handleRequest(request, env, context = {}, overrides = {}) {
  const url = new URL(request.url);
  const store = overrides.store || createD1AlertStore(env.DB);
  const ready = authenticationReady(env);

  if (request.method === "GET" && url.pathname === "/health") {
    return json({
      ok: true,
      ready,
      service: "trading-companion-webhook",
      version: WORKER_VERSION
    }, 200, corsHeaders(request, env));
  }

  if (request.method === "POST" && url.pathname.startsWith("/v1/webhooks/tradingview/")) {
    if (!ready) {
      return json({ ok: false, error: "service_not_configured" }, 503);
    }
    let token = "";
    try {
      token = decodeURIComponent(
        url.pathname.slice("/v1/webhooks/tradingview/".length)
      );
    } catch (error) {
      return json({ ok: false, error: "not_found" }, 404);
    }
    return handleWebhook(request, env, store, context, token);
  }

  if (!requestOriginAllowed(request, env)) {
    return json({ ok: false, error: "origin_not_allowed" }, 403);
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  }

  if (!ready) {
    return json(
      { ok: false, error: "service_not_configured" },
      503,
      corsHeaders(request, env)
    );
  }

  if (!env.SYNC_API_TOKEN || !secureEqual(bearerToken(request), env.SYNC_API_TOKEN)) {
    return json({ ok: false, error: "unauthorized" }, 401, corsHeaders(request, env));
  }

  if (request.method === "GET" && url.pathname === "/v1/alerts") {
    return handleList(request, env, store, context);
  }

  const alertMatch = url.pathname.match(/^\/v1\/alerts\/([a-f0-9]{64})$/);
  if (alertMatch && request.method === "PATCH") {
    return handleDecision(request, env, store, alertMatch[1]);
  }
  if (alertMatch && request.method === "DELETE") {
    return handleDelete(request, env, store, alertMatch[1]);
  }

  return json({ ok: false, error: "not_found" }, 404, corsHeaders(request, env));
}

export default {
  fetch(request, env, context) {
    return handleRequest(request, env, context);
  }
};
