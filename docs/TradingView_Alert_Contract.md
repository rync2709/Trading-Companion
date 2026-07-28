# TradingView Alert Contract

Version: v1
Status: Local import baseline

## Purpose

`trading-companion.alert.v1` is the data contract between the Trading OS Pine
indicator and Trading Companion. Pine creates the JSON payload on a confirmed
alert event. Trading Companion validates and stores an imported payload in the
current browser.

## Payload

```json
{
  "schema": "trading-companion.alert.v1",
  "source": "tradingview",
  "indicator": "trading-os",
  "indicatorVersion": "0.14.0",
  "event": "ENTRY FVG RETRACE BULL",
  "symbol": "FOREXCOM:XAUUSD",
  "ticker": "XAUUSD",
  "timeframe": "15",
  "time": 1785240000000,
  "mode": "manual",
  "narrative": "bullish",
  "state": "developing",
  "score": 90,
  "grade": "A+",
  "blocked": false,
  "checklist": {
    "htf": true,
    "poi": true,
    "liquidity": true,
    "structure": true,
    "cisd": true,
    "displacement": true,
    "entryFvg": false,
    "risk": false
  },
  "risk": {
    "entry": null,
    "stop": null,
    "target": null,
    "rr": null
  },
  "close": 4025.5
}
```

## Validation

- `schema`, `source`, and `indicator` must match the contract.
- Symbol, ticker, timeframe, and a positive TradingView close time are required.
- Narrative, state, mode, and Grade must use supported values.
- Score must be an integer from 0 to 100.
- Every checklist value must be a JSON boolean.
- In Manual mode, Score must equal the enabled checklist weights unless the
  payload is explicitly blocked.
- Duplicate symbol, timeframe, time, and event combinations update one Inbox
  record instead of creating duplicates.

## Local Workflow

1. Copy the JSON message from a TradingView alert.
2. Paste it into Indicator Alert Inbox in TradingView Hub.
3. Choose WAIT, SKIP, or Review Entry.
4. Review Entry creates a New Trade Draft from compatible evidence only.
5. Trading Companion recalculates its own detailed score before ENTRY.

## Limits

- GitHub Pages cannot receive TradingView webhooks.
- The current baseline is a manual JSON transfer stored in browser localStorage.
- Alerts still require a user-created TradingView alert using
  `Any alert() function call`.
- No payload places an order or bypasses New Trade risk validation.
- Review Entry currently supports XAUUSD, BTCUSD, ETHUSD, NAS100, and EURUSD.
  Other symbols remain in the Inbox for WAIT or SKIP instead of being mapped
  to the wrong instrument.
- A direct webhook requires an authenticated backend with duplicate handling
  and an explicit device-sync model.
