-- Allow STAFF role for driver / personnel tracker accounts (PostgreSQL).
-- Safe to run multiple times.

ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_role_check;

ALTER TABLE app_users
  ADD CONSTRAINT app_users_role_check
  CHECK (role IN ('ADMIN', 'TEACHER', 'PARENT', 'STUDENT', 'STAFF'));

-- Portal login id (added in a later app version; harmless if already present).
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS login_id character varying(255);

CREATE UNIQUE INDEX IF NOT EXISTS uk_app_users_login_id ON app_users (login_id)
  WHERE login_id IS NOT NULL;
