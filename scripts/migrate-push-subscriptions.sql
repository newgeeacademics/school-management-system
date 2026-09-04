-- Web Push subscriptions for portal users (run on Neon when not using ddl-auto=update)
-- Preview:
-- SELECT id, app_user_id, left(endpoint, 60) AS endpoint, created_at FROM push_subscriptions;

BEGIN;

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    app_user_id VARCHAR(36) NOT NULL,
    endpoint VARCHAR(2048) NOT NULL UNIQUE,
    p256dh VARCHAR(512) NOT NULL,
    auth_key VARCHAR(512) NOT NULL,
    created_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_app_user ON push_subscriptions (app_user_id);

COMMIT;
