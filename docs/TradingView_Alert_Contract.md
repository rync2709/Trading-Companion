# TradingView Alert Contract

Version: v1
Status: Production receiver, TradingView alert, and protected Webhook active

## Purpose

`trading-companion.alert.v1` is the data contract between the Trading OS Pine
indicator and Trading Companion. Pine creates the JSON payload on a confirmed
alert event. Trading Companion can validate a manually imported payload or
synchronize the same payload from a private Webhook Worker.

## Payload

```json
{
  "schema": "trading-companion.alert.v1",
  "source": "tradingview",
  "indicator": "trading-os",
  "indicatorVersion": "0.16.2",
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

## Manual Workflow

1. Copy the JSON message from a TradingView alert.
2. Paste it into Indicator Alert Inbox in TradingView Hub.
3. Choose WAIT, SKIP, or Review Entry.
4. Review Entry creates a New Trade Draft from compatible evidence only.
5. Trading Companion recalculates its own detailed score before ENTRY.

## Automatic Workflow

1. TradingView posts the JSON payload to the private Worker URL.
2. The Worker validates the Webhook token, payload size, and Alert contract.
3. A SHA-256 identifier deduplicates matching payloads in D1.
4. Trading Companion authenticates with a separate Sync token.
5. Manual or optional 60-second Sync merges remote Alerts into the local Inbox.
6. WAIT, SKIP, and delete changes are written to the remote Inbox first and
   then reflected locally.

The production Worker and Trading Companion Sync path passed this workflow with
a contract-valid synthetic Alert on 2026-07-30. Pine v0.14.1 compiled and a
running `Any alert() function call` alert was created the same day. After
enabling TradingView two-factor authentication and attaching the protected
Worker URL, a live TradingView price alert reached the production Worker. The
temporary TradingView alert and remote test record were deleted after
verification.

Pine v0.16.2 is the current private chart version. Its Balanced/Strict profiles
and Entry FVG evidence locking do not alter this contract. The existing
v0.14.1 production alert remains active until a deliberate alert migration is
completed.

## Compact Fallback

Pine v0.14.1 also exposes a named `Trading Companion Sync` condition. Its
constant JSON message includes `snapshotCode`, one integer containing mode,
Narrative, State, Score, Grade, blocked state, and all eight checklist values.
The shared contract decoder reconstructs the normal payload before validation.
The dynamic `alert()` payload remains the preferred condition because it also
includes the detailed event list and available Risk Plan.

## Worker API

- `GET /health`
- `POST /v1/webhooks/tradingview/:webhookToken`
- `GET /v1/alerts?since=0&limit=50`
- `PATCH /v1/alerts/:id`
- `DELETE /v1/alerts/:id`

Browser routes require:

```text
Authorization: Bearer <SYNC_API_TOKEN>
```

## Security and Retention

- `TRADINGVIEW_WEBHOOK_TOKEN` and `SYNC_API_TOKEN` must be different random
  values with at least 32 characters.
- Browser requests are restricted by `ALLOWED_ORIGINS`.
- Production secrets must be stored as Cloudflare Secrets and never committed.
- Remote Alerts expire after 30 days by default.
- Delete creates a tombstone so other devices remove the matching local Alert
  during their next Sync.
- The local browser keeps working without a remote connection.

## Limits

- GitHub Pages cannot receive TradingView webhooks.
- The Worker, production D1, Secrets, allowed origin, and Companion connection
  are active.
- The running chart alert is active with TradingView app and protected Webhook
  notifications.
- Live TradingView-to-Worker delivery was verified on 2026-07-30.
- Manual JSON transfer remains available and is stored in browser localStorage.
- Alerts use the private user-created
  `Any alert() function call` TradingView alert.
- No payload places an order or bypasses New Trade risk validation.
- Review Entry currently supports XAUUSD, BTCUSD, ETHUSD, NAS100, and EURUSD.
  Other symbols remain in the Inbox for WAIT or SKIP instead of being mapped
  to the wrong instrument.
- The Worker synchronizes Indicator Alert Inbox records only. Journal, plans,
  screenshots, Playbooks, and other Trading Companion data remain local.
