-- Safe driver deletion (PostgreSQL / Neon)
-- Fixes: "update or delete on table drivers violates foreign key constraint ... transport_routes"
--
-- Usage:
--   1. Set p_driver_id below (or pass via psql -v driver_id='uuid-here')
--   2. Run the PREVIEW block first
--   3. Choose UNLINK (keeps routes) or DELETE_ROUTES (removes routes + trips)
--   4. Run the chosen DELETE block

-- =============================================================================
-- PREVIEW — what blocks this driver?
-- =============================================================================
-- Replace UUID:
--   0f9a8a0c-c589-4cd7-9f18-9e69378a952a

SELECT d.id, d.name, d.staff_id, d.email, d.app_user_id
FROM drivers d
WHERE d.id = '0f9a8a0c-c589-4cd7-9f18-9e69378a952a';

SELECT tr.id, tr.name, tr.driver_name, tr.driver_id
FROM transport_routes tr
WHERE tr.driver_id = '0f9a8a0c-c589-4cd7-9f18-9e69378a952a';

SELECT bt.id, bt.route_id, bt.status
FROM bus_trips bt
WHERE bt.route_id IN (
  SELECT tr.id FROM transport_routes tr
  WHERE tr.driver_id = '0f9a8a0c-c589-4cd7-9f18-9e69378a952a'
);

-- All foreign keys pointing at drivers (any driver)
SELECT
  tc.constraint_name,
  kcu.table_name AS referencing_table,
  kcu.column_name AS referencing_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_schema = kcu.constraint_schema
 AND tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_schema = tc.constraint_schema
 AND ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_schema = 'public'
  AND ccu.table_name = 'drivers'
ORDER BY kcu.table_name;


-- =============================================================================
-- OPTION A (recommended): UNLINK routes, then delete driver + portal account
-- Keeps transport routes; driver_name text stays on the route.
-- Uncomment the block below, set p_driver_id, then run.
-- =============================================================================
/*
BEGIN;

DO $$
DECLARE
  p_driver_id text := '0f9a8a0c-c589-4cd7-9f18-9e69378a952a';  -- CHANGE ME
  v_app_user_id text;
  v_route_count int;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM drivers WHERE id = p_driver_id) THEN
    RAISE EXCEPTION 'Driver not found: %', p_driver_id;
  END IF;

  SELECT COUNT(*) INTO v_route_count
  FROM transport_routes
  WHERE driver_id = p_driver_id;

  RAISE NOTICE 'Unlinking % transport route(s) from driver %', v_route_count, p_driver_id;

  UPDATE transport_routes
  SET driver_id = NULL
  WHERE driver_id = p_driver_id;

  SELECT app_user_id INTO v_app_user_id
  FROM drivers
  WHERE id = p_driver_id;

  DELETE FROM drivers WHERE id = p_driver_id;

  IF v_app_user_id IS NOT NULL THEN
    DELETE FROM app_users WHERE id = v_app_user_id;
    RAISE NOTICE 'Deleted linked app_user %', v_app_user_id;
  END IF;

  RAISE NOTICE 'Driver % deleted (routes kept, driver_id cleared).', p_driver_id;
END $$;

COMMIT;
*/


-- =============================================================================
-- OPTION B: DELETE routes assigned to this driver (and trips / waypoints / students)
-- Use only if those routes should be removed entirely.
-- =============================================================================
/*
BEGIN;

DO $$
DECLARE
  p_driver_id text := '0f9a8a0c-c589-4cd7-9f18-9e69378a952a';  -- CHANGE ME
  v_app_user_id text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM drivers WHERE id = p_driver_id) THEN
    RAISE EXCEPTION 'Driver not found: %', p_driver_id;
  END IF;

  DELETE FROM bus_trips
  WHERE route_id IN (
    SELECT id FROM transport_routes WHERE driver_id = p_driver_id
  );

  DELETE FROM transport_route_waypoints
  WHERE route_id IN (
    SELECT id FROM transport_routes WHERE driver_id = p_driver_id
  );

  DELETE FROM transport_route_students
  WHERE route_id IN (
    SELECT id FROM transport_routes WHERE driver_id = p_driver_id
  );

  DELETE FROM transport_routes
  WHERE driver_id = p_driver_id;

  SELECT app_user_id INTO v_app_user_id
  FROM drivers
  WHERE id = p_driver_id;

  DELETE FROM drivers WHERE id = p_driver_id;

  IF v_app_user_id IS NOT NULL THEN
    DELETE FROM app_users WHERE id = v_app_user_id;
  END IF;

  RAISE NOTICE 'Driver % and assigned routes deleted.', p_driver_id;
END $$;

COMMIT;
*/


-- =============================================================================
-- BULK: remove duplicate placeholder drivers (DRV-00000000), keep one per name
-- Run scripts/fix-driver-staff-ids.sql first if staff_id collisions remain.
-- =============================================================================
/*
BEGIN;

-- Unlink all routes from drivers that will be removed
UPDATE transport_routes tr
SET driver_id = NULL
WHERE tr.driver_id IN (
  SELECT d.id
  FROM drivers d
  WHERE d.staff_id = 'DRV-00000000'
     OR d.id NOT IN (
       SELECT DISTINCT ON (COALESCE(d2.email, d2.phone, d2.name)) d2.id
       FROM drivers d2
       ORDER BY COALESCE(d2.email, d2.phone, d2.name), d2.id
     )
);

-- Delete duplicate / placeholder drivers (adjust WHERE as needed)
DELETE FROM drivers d
WHERE d.staff_id = 'DRV-00000000'
  AND d.id <> (
    SELECT MIN(id) FROM drivers d2 WHERE d2.staff_id = 'DRV-00000000'
  );

COMMIT;
*/
