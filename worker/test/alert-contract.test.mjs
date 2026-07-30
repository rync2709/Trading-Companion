import assert from "node:assert/strict";
import test from "node:test";

import {
  decodeAlertSnapshotCode,
  parseIndicatorAlert
} from "../../shared/alert-contract.mjs";

const MANUAL_BULLISH_DEVELOPING_A_PLUS = 8304275;

test("decodes the compact Pine snapshot without losing checklist state", () => {
  assert.deepEqual(
    decodeAlertSnapshotCode(MANUAL_BULLISH_DEVELOPING_A_PLUS),
    {
      mode: "manual",
      narrative: "bullish",
      state: "developing",
      score: 90,
      grade: "A+",
      blocked: false,
      checklist: {
        htf: true,
        poi: true,
        liquidity: true,
        structure: true,
        cisd: true,
        displacement: true,
        entryFvg: false,
        risk: false
      }
    }
  );
});

test("parses the named TradingView alertcondition payload", () => {
  const alert = parseIndicatorAlert({
    schema: "trading-companion.alert.v1",
    source: "tradingview",
    indicator: "trading-os",
    indicatorVersion: "0.14.1",
    event: "TRADING OS UPDATE",
    symbol: "FOREXCOM:XAUUSD",
    ticker: "XAUUSD",
    timeframe: "15",
    time: "2026-07-30T14:30:00Z",
    snapshotCode: MANUAL_BULLISH_DEVELOPING_A_PLUS,
    risk: {
      entry: null,
      stop: null,
      target: null,
      rr: null
    },
    close: 4100.5
  });

  assert.equal(alert.time, 1785421800000);
  assert.equal(alert.mode, "manual");
  assert.equal(alert.score, 90);
  assert.equal(alert.checklist.displacement, true);
  assert.equal(alert.occurredAt, "2026-07-30T14:30:00.000Z");
});

test("rejects malformed compact snapshots", () => {
  assert.throws(
    () => decodeAlertSnapshotCode(33554432),
    /snapshot code/
  );
});
