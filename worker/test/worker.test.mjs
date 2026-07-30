import assert from "node:assert/strict";
import test from "node:test";

import { ALERT_EXAMPLE } from "../../shared/alert-contract.mjs";
import { handleRequest } from "../src/index.mjs";

function createMemoryStore() {
  const records = new Map();
  return {
    async upsert(record) {
      const existing = records.get(record.id);
      const next = existing ? {
        ...existing,
        payload: record.payload,
        updatedAt: record.updatedAt
      } : {
        id: record.id,
        payload: record.payload,
        decision: "new",
        receivedAt: record.receivedAt,
        updatedAt: record.updatedAt,
        deleted: false,
        deletedAt: null
      };
      records.set(record.id, next);
      return next;
    },
    async list({ since, limit }) {
      return Array.from(records.values())
        .filter((item) => item.updatedAt >= since)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, limit);
    },
    async updateDecision(id, decision, now) {
      const item = records.get(id);
      if (!item || item.deleted) return null;
      const next = { ...item, decision, updatedAt: now };
      records.set(id, next);
      return next;
    },
    async softDelete(id, now) {
      const item = records.get(id);
      if (!item || item.deleted) return null;
      const next = { ...item, deleted: true, deletedAt: now, updatedAt: now };
      records.set(id, next);
      return next;
    },
    async cleanup(cutoff) {
      records.forEach((item, id) => {
        if (item.updatedAt < cutoff) records.delete(id);
      });
    }
  };
}

const env = {
  ALLOWED_ORIGINS: "https://rync2709.github.io,http://127.0.0.1:4173",
  RETENTION_DAYS: "30",
  TRADINGVIEW_WEBHOOK_TOKEN: "webhook-token-with-at-least-32-characters",
  SYNC_API_TOKEN: "sync-token-with-at-least-32-characters"
};

function request(path, init = {}) {
  return new Request(`https://alerts.example.com${path}`, init);
}

async function responseJson(response) {
  return {
    status: response.status,
    body: await response.json()
  };
}

test("accepts, deduplicates, lists, updates, and deletes an alert", async () => {
  const store = createMemoryStore();
  const webhookPath = `/v1/webhooks/tradingview/${env.TRADINGVIEW_WEBHOOK_TOKEN}`;
  const webhookInit = {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(ALERT_EXAMPLE)
  };

  const first = await responseJson(await handleRequest(
    request(webhookPath, webhookInit),
    env,
    {},
    { store }
  ));
  assert.equal(first.status, 202);
  assert.equal(first.body.ok, true);
  assert.match(first.body.alert.id, /^[a-f0-9]{64}$/);

  const second = await responseJson(await handleRequest(
    request(webhookPath, webhookInit),
    env,
    {},
    { store }
  ));
  assert.equal(second.body.alert.id, first.body.alert.id);

  const authHeaders = {
    authorization: `Bearer ${env.SYNC_API_TOKEN}`,
    origin: "https://rync2709.github.io"
  };
  const list = await responseJson(await handleRequest(
    request("/v1/alerts", { headers: authHeaders }),
    env,
    {},
    { store }
  ));
  assert.equal(list.status, 200);
  assert.equal(list.body.alerts.length, 1);
  assert.equal(list.body.alerts[0].payload.ticker, "XAUUSD");

  const id = first.body.alert.id;
  const update = await responseJson(await handleRequest(
    request(`/v1/alerts/${id}`, {
      method: "PATCH",
      headers: {
        ...authHeaders,
        "content-type": "application/json"
      },
      body: JSON.stringify({ decision: "wait" })
    }),
    env,
    {},
    { store }
  ));
  assert.equal(update.status, 200);
  assert.equal(update.body.alert.decision, "wait");

  const deleted = await responseJson(await handleRequest(
    request(`/v1/alerts/${id}`, {
      method: "DELETE",
      headers: authHeaders
    }),
    env,
    {},
    { store }
  ));
  assert.equal(deleted.status, 200);
  assert.equal(deleted.body.alert.deleted, true);
});

test("rejects invalid secrets, origins, tokens, and alert payloads", async () => {
  const store = createMemoryStore();
  const badWebhook = await handleRequest(
    request("/v1/webhooks/tradingview/wrong", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(ALERT_EXAMPLE)
    }),
    env,
    {},
    { store }
  );
  assert.equal(badWebhook.status, 404);

  const invalidAlert = await handleRequest(
    request(`/v1/webhooks/tradingview/${env.TRADINGVIEW_WEBHOOK_TOKEN}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...ALERT_EXAMPLE, score: 91 })
    }),
    env,
    {},
    { store }
  );
  assert.equal(invalidAlert.status, 422);

  const badOrigin = await handleRequest(
    request("/v1/alerts", {
      headers: {
        authorization: `Bearer ${env.SYNC_API_TOKEN}`,
        origin: "https://attacker.example"
      }
    }),
    env,
    {},
    { store }
  );
  assert.equal(badOrigin.status, 403);

  const badToken = await handleRequest(
    request("/v1/alerts", {
      headers: {
        authorization: "Bearer wrong",
        origin: "https://rync2709.github.io"
      }
    }),
    env,
    {},
    { store }
  );
  assert.equal(badToken.status, 401);
});

test("health and CORS preflight do not expose secrets", async () => {
  const store = createMemoryStore();
  const health = await responseJson(await handleRequest(
    request("/health", {
      headers: { origin: "https://rync2709.github.io" }
    }),
    env,
    {},
    { store }
  ));
  assert.equal(health.status, 200);
  assert.equal(health.body.version, "0.1.0");
  assert.equal(health.body.ready, true);
  assert.equal(JSON.stringify(health.body).includes("token"), false);

  const preflight = await handleRequest(
    request("/v1/alerts", {
      method: "OPTIONS",
      headers: { origin: "https://rync2709.github.io" }
    }),
    env,
    {},
    { store }
  );
  assert.equal(preflight.status, 204);
  assert.equal(
    preflight.headers.get("access-control-allow-origin"),
    "https://rync2709.github.io"
  );
});

test("refuses traffic until two distinct strong secrets are configured", async () => {
  const store = createMemoryStore();
  const weakEnv = {
    ...env,
    TRADINGVIEW_WEBHOOK_TOKEN: "short",
    SYNC_API_TOKEN: "short"
  };
  const health = await responseJson(await handleRequest(
    request("/health"),
    weakEnv,
    {},
    { store }
  ));
  assert.equal(health.status, 200);
  assert.equal(health.body.ready, false);

  const webhook = await responseJson(await handleRequest(
    request("/v1/webhooks/tradingview/short", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(ALERT_EXAMPLE)
    }),
    weakEnv,
    {},
    { store }
  ));
  assert.equal(webhook.status, 503);
  assert.equal(webhook.body.error, "service_not_configured");

  const sharedSecret = "same-secret-with-at-least-32-characters";
  const sameEnv = {
    ...env,
    TRADINGVIEW_WEBHOOK_TOKEN: sharedSecret,
    SYNC_API_TOKEN: sharedSecret
  };
  const inbox = await responseJson(await handleRequest(
    request("/v1/alerts", {
      headers: { authorization: `Bearer ${sharedSecret}` }
    }),
    sameEnv,
    {},
    { store }
  ));
  assert.equal(inbox.status, 503);
  assert.equal(inbox.body.error, "service_not_configured");
});
