import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

import { ALERT_EXAMPLE } from "../../shared/alert-contract.mjs";

const values = new Map();
globalThis.localStorage = {
  getItem(key) {
    return values.has(key) ? values.get(key) : null;
  },
  setItem(key, value) {
    values.set(key, value);
  },
  removeItem(key) {
    values.delete(key);
  }
};
let sequence = 0;
globalThis.window = {
  crypto: {
    randomUUID() {
      sequence += 1;
      return `local-${sequence}`;
    }
  }
};

const source = await readFile(
  new URL("../../js/storage.js", import.meta.url),
  "utf8"
);
vm.runInThisContext(source, { filename: "js/storage.js" });
const storage = globalThis.window.TradingStorage;

test("stores and clears private integration settings locally", () => {
  const saved = storage.saveIntegrationSettings({
    baseUrl: "https://alerts.example.com",
    syncToken: "x".repeat(32),
    autoSync: true,
    retentionDays: 30
  });
  assert.equal(saved.autoSync, true);
  assert.equal(storage.loadIntegrationSettings().syncToken, "x".repeat(32));
  storage.clearIntegrationSettings();
  assert.equal(storage.loadIntegrationSettings().baseUrl, "");
});

test("merges remote alerts and honors the newest remote decision", () => {
  values.delete(storage.KEYS.indicatorAlerts);
  storage.saveIndicatorAlert(ALERT_EXAMPLE);
  const remoteId = "b".repeat(64);

  storage.mergeRemoteIndicatorAlerts([{
    remoteId,
    payload: ALERT_EXAMPLE,
    decision: "wait",
    remoteReceivedAt: 1785240000100,
    remoteUpdatedAt: 1785240000200,
    deleted: false
  }]);
  let alerts = storage.loadIndicatorAlerts();
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].remoteId, remoteId);
  assert.equal(alerts[0].decision, "wait");

  storage.updateIndicatorAlertDecision(alerts[0].id, "skip");
  storage.mergeRemoteIndicatorAlerts([{
    remoteId,
    payload: ALERT_EXAMPLE,
    decision: "wait",
    remoteReceivedAt: 1785240000100,
    remoteUpdatedAt: 1785240000100,
    deleted: false
  }]);
  alerts = storage.loadIndicatorAlerts();
  assert.equal(alerts[0].decision, "skip");

  storage.mergeRemoteIndicatorAlerts([{
    remoteId,
    payload: ALERT_EXAMPLE,
    decision: "review",
    remoteReceivedAt: 1785240000100,
    remoteUpdatedAt: 1785240000300,
    deleted: false
  }]);
  alerts = storage.loadIndicatorAlerts();
  assert.equal(alerts[0].decision, "review");

  const merged = storage.mergeRemoteIndicatorAlerts([{
    remoteId,
    payload: ALERT_EXAMPLE,
    decision: "review",
    remoteReceivedAt: 1785240000100,
    remoteUpdatedAt: 1785240000400,
    deleted: true
  }]);
  assert.equal(merged.deleted, 1);
  assert.equal(storage.loadIndicatorAlerts().length, 0);
});
