import {
  ALERT_DECISIONS,
  INBOX_SCHEMA,
  normalizeDecision,
  parseIndicatorAlert
} from "../shared/alert-contract.mjs";

export function normalizeBaseUrl(value) {
  const source = String(value || "").trim();
  if (!source) throw new Error("กรุณาใส่ Server URL");

  let url;
  try {
    url = new URL(source);
  } catch (error) {
    throw new Error("Server URL ไม่ถูกต้อง");
  }
  if (url.username || url.password) {
    throw new Error("Server URL ต้องไม่มี username หรือ password");
  }
  const localHost = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && localHost)) {
    throw new Error("Server URL ต้องใช้ HTTPS");
  }
  if (url.search || url.hash) {
    throw new Error("Server URL ต้องไม่มี query หรือ hash");
  }
  return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
}

export function validateSyncToken(value) {
  const token = String(value || "").trim();
  if (token.length < 32 || token.length > 512) {
    throw new Error("Sync Token ต้องมีอย่างน้อย 32 ตัวอักษร");
  }
  return token;
}

async function readResponse(response) {
  let body = null;
  try {
    body = await response.json();
  } catch (error) {
    body = null;
  }
  if (!response.ok) {
    const message = body && (body.message || body.error);
    const failure = new Error(message || `Server ตอบกลับ ${response.status}`);
    failure.status = response.status;
    throw failure;
  }
  return body;
}

function normalizeRemoteAlert(record) {
  if (!record || typeof record !== "object") {
    throw new Error("Remote Inbox record ไม่ถูกต้อง");
  }
  const remoteId = String(record.id || "").toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(remoteId)) {
    throw new Error("Remote Alert ID ไม่ถูกต้อง");
  }
  const remoteUpdatedAt = Number(record.updatedAt);
  const remoteReceivedAt = Number(record.receivedAt);
  if (
    !Number.isSafeInteger(remoteUpdatedAt) ||
    !Number.isSafeInteger(remoteReceivedAt)
  ) {
    throw new Error("Remote Alert time ไม่ถูกต้อง");
  }
  return {
    remoteId,
    payload: parseIndicatorAlert(record.payload),
    decision: normalizeDecision(record.decision),
    remoteReceivedAt,
    remoteUpdatedAt,
    deleted: record.deleted === true,
    deletedAt: record.deletedAt === null ? null : Number(record.deletedAt)
  };
}

export function createInboxClient(options = {}) {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const token = validateSyncToken(options.token);
  const fetchImpl = options.fetchImpl || fetch;

  async function api(path, init = {}) {
    const headers = new Headers(init.headers || {});
    headers.set("authorization", `Bearer ${token}`);
    if (init.body) headers.set("content-type", "application/json");
    const response = await fetchImpl(`${baseUrl}${path}`, {
      ...init,
      headers,
      cache: "no-store"
    });
    return readResponse(response);
  }

  return {
    baseUrl,

    async test() {
      const healthResponse = await fetchImpl(`${baseUrl}/health`, {
        cache: "no-store"
      });
      const health = await readResponse(healthResponse);
      const inbox = await api("/v1/alerts?limit=1");
      if (inbox.schema !== INBOX_SCHEMA) {
        throw new Error("Server ใช้ Inbox schema ที่ไม่รองรับ");
      }
      return {
        service: health.service || "",
        version: health.version || "",
        retentionDays: Number(inbox.retentionDays) || null
      };
    },

    async list(options = {}) {
      const since = Number.isSafeInteger(options.since) && options.since > 0 ?
        options.since : 0;
      const limit = Number.isInteger(options.limit) ?
        Math.max(1, Math.min(options.limit, 100)) : 50;
      const result = await api(
        `/v1/alerts?since=${encodeURIComponent(since)}&limit=${encodeURIComponent(limit)}`
      );
      if (result.schema !== INBOX_SCHEMA || !Array.isArray(result.alerts)) {
        throw new Error("Remote Inbox response ไม่ถูกต้อง");
      }
      return {
        alerts: result.alerts.map(normalizeRemoteAlert),
        retentionDays: Number(result.retentionDays) || null,
        serverTime: Number(result.serverTime) || null
      };
    },

    async updateDecision(id, decision) {
      if (!/^[a-f0-9]{64}$/.test(String(id || ""))) {
        throw new Error("Remote Alert ID ไม่ถูกต้อง");
      }
      if (!ALERT_DECISIONS.includes(decision)) {
        throw new Error("Alert decision ไม่ถูกต้อง");
      }
      const result = await api(`/v1/alerts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ decision })
      });
      return normalizeRemoteAlert(result.alert);
    },

    async delete(id) {
      if (!/^[a-f0-9]{64}$/.test(String(id || ""))) {
        throw new Error("Remote Alert ID ไม่ถูกต้อง");
      }
      const result = await api(`/v1/alerts/${id}`, { method: "DELETE" });
      return normalizeRemoteAlert(result.alert);
    }
  };
}
