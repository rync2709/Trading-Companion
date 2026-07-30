import assert from "node:assert/strict";
import test from "node:test";

import {
  createInboxClient,
  normalizeBaseUrl,
  validateSyncToken
} from "../../js/integration-api.mjs";
import { ALERT_EXAMPLE, INBOX_SCHEMA } from "../../shared/alert-contract.mjs";

const token = "sync-token-with-at-least-32-characters";
const remoteId = "a".repeat(64);

test("normalizes secure URLs and rejects unsafe connection settings", () => {
  assert.equal(
    normalizeBaseUrl("https://alerts.example.com/"),
    "https://alerts.example.com"
  );
  assert.equal(
    normalizeBaseUrl("http://127.0.0.1:8787/"),
    "http://127.0.0.1:8787"
  );
  assert.throws(() => normalizeBaseUrl("http://alerts.example.com"));
  assert.throws(() => normalizeBaseUrl("https://user:pass@alerts.example.com"));
  assert.throws(() => validateSyncToken("short"));
  assert.equal(validateSyncToken(token), token);
});

test("client validates and normalizes remote inbox records", async () => {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, init });
    if (url.endsWith("/health")) {
      return Response.json({
        ok: true,
        service: "trading-companion-webhook",
        version: "0.1.0"
      });
    }
    if (url.includes("/v1/alerts?")) {
      return Response.json({
        schema: INBOX_SCHEMA,
        retentionDays: 30,
        serverTime: 1785241000000,
        alerts: [{
          id: remoteId,
          payload: ALERT_EXAMPLE,
          decision: "wait",
          receivedAt: 1785240000100,
          updatedAt: 1785240000200,
          deleted: false,
          deletedAt: null
        }]
      });
    }
    return Response.json({ error: "not_found" }, { status: 404 });
  };
  const client = createInboxClient({
    baseUrl: "https://alerts.example.com",
    token,
    fetchImpl
  });

  const health = await client.test();
  assert.equal(health.version, "0.1.0");
  const inbox = await client.list();
  assert.equal(inbox.alerts.length, 1);
  assert.equal(inbox.alerts[0].payload.ticker, "XAUUSD");
  assert.equal(inbox.alerts[0].decision, "wait");
  assert.equal(
    calls.at(-1).init.headers.get("authorization"),
    `Bearer ${token}`
  );
});

test("client sends decision and delete requests with authentication", async () => {
  const calls = [];
  const remoteRecord = {
    id: remoteId,
    payload: ALERT_EXAMPLE,
    decision: "skip",
    receivedAt: 1785240000100,
    updatedAt: 1785240000300,
    deleted: false,
    deletedAt: null
  };
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, init });
    if (init.method === "DELETE") {
      return Response.json({
        ok: true,
        alert: { ...remoteRecord, deleted: true, deletedAt: 1785240000400 }
      });
    }
    return Response.json({ ok: true, alert: remoteRecord });
  };
  const client = createInboxClient({
    baseUrl: "https://alerts.example.com",
    token,
    fetchImpl
  });

  const updated = await client.updateDecision(remoteId, "skip");
  assert.equal(updated.decision, "skip");
  assert.equal(calls[0].init.method, "PATCH");
  assert.equal(JSON.parse(calls[0].init.body).decision, "skip");

  const deleted = await client.delete(remoteId);
  assert.equal(deleted.deleted, true);
  assert.equal(calls[1].init.method, "DELETE");
});
