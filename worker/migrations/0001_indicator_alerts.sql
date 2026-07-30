CREATE TABLE IF NOT EXISTS indicator_alerts (
  id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL UNIQUE,
  payload TEXT NOT NULL,
  decision TEXT NOT NULL DEFAULT 'new'
    CHECK (decision IN ('new', 'wait', 'skip', 'review')),
  received_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_indicator_alerts_updated_at
  ON indicator_alerts (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_indicator_alerts_received_at
  ON indicator_alerts (received_at);
