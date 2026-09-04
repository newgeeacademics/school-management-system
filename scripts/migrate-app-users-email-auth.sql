-- Email verification + password reset columns on app_users (PostgreSQL / Neon)
-- Safe to run multiple times (IF NOT EXISTS).
-- Run in Neon SQL Editor if school registration fails with:
--   column "email_verified" of relation "app_users" does not exist

BEGIN;

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS login_id character varying(255);
CREATE UNIQUE INDEX IF NOT EXISTS uk_app_users_login_id ON app_users (login_id)
  WHERE login_id IS NOT NULL;

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT true;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS email_verify_token character varying(255);
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS email_verify_expires_at timestamp(6) with time zone;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS password_reset_token character varying(255);
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS password_reset_expires_at timestamp(6) with time zone;

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS password_setup_required boolean NOT NULL DEFAULT false;

-- Existing accounts already have a password
UPDATE app_users SET password_setup_required = false WHERE password_setup_required IS NULL;
UPDATE app_users SET email_verified = true WHERE email_verified IS NULL;

COMMIT;

-- Verify:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'app_users' AND column_name LIKE 'email%' OR column_name LIKE 'password_reset%';
