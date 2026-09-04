-- Delete driver + portal account (PostgreSQL / Neon)
-- Keeps transport routes; clears driver_id on routes.
-- Paste the whole block below into Neon SQL Editor and Run.

BEGIN;

UPDATE transport_routes
SET driver_id = NULL
WHERE driver_id = '80bdf2b1-ab2d-4c14-b630-14180b79d0da';

DO $$
DECLARE
  v_app_user_id text;
BEGIN
  SELECT app_user_id INTO v_app_user_id
  FROM drivers
  WHERE id = '80bdf2b1-ab2d-4c14-b630-14180b79d0da';

  DELETE FROM drivers
  WHERE id = '80bdf2b1-ab2d-4c14-b630-14180b79d0da';

  IF v_app_user_id IS NOT NULL THEN
    DELETE FROM app_users WHERE id = v_app_user_id;
  END IF;
END $$;

COMMIT;
-- ROLLBACK;
