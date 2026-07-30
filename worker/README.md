# Trading Companion Webhook Worker

Version: v0.1.0
Status: Deployment-ready source, not yet connected to production

This Cloudflare Worker receives Trading OS alerts from TradingView and stores
them in D1 for cross-device Trading Companion Inbox synchronization.

## Security Model

- `TRADINGVIEW_WEBHOOK_TOKEN` protects the TradingView POST URL.
- `SYNC_API_TOKEN` protects Inbox reads and decision updates.
- `ALLOWED_ORIGINS` restricts browser requests to approved Trading Companion
  origins.
- The two tokens must be different, random values with at least 32 characters.
- Secrets belong in Cloudflare Secrets, never in Git or `wrangler.toml`.

## API

- `GET /health`
- `POST /v1/webhooks/tradingview/:webhookToken`
- `GET /v1/alerts?since=0&limit=50`
- `PATCH /v1/alerts/:id`
- `DELETE /v1/alerts/:id`

The browser routes require:

```text
Authorization: Bearer <SYNC_API_TOKEN>
```

## Retention

Alerts remain for 30 days by default. Delete uses a tombstone so another
device can remove its matching local record on the next synchronization.
Expired records are removed during normal API activity.

## Deployment Prerequisites

1. Create or log in to a Cloudflare account.
2. Install dependencies inside `worker/`.
3. Copy `wrangler.toml.example` to `wrangler.toml`.
4. Create the D1 database and replace `REPLACE_WITH_D1_DATABASE_ID`.
5. Apply `migrations/0001_indicator_alerts.sql`.
6. Add `TRADINGVIEW_WEBHOOK_TOKEN` and `SYNC_API_TOKEN` with Wrangler Secrets.
7. Deploy the Worker.
8. Add the Worker URL and Sync token in Trading Companion.
9. Add the protected webhook URL to the TradingView alert.

Do not deploy until both tokens and the allowed production origin are set.
