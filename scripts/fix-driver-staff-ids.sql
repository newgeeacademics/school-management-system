-- Fix duplicate driver staff_id values (e.g. DRV-00000000).
-- Run on Neon / PostgreSQL after driver creation fails with:
--   duplicate key value violates unique constraint "ukf77496pu3qjo4s3ltfvr3oeyx"
--
-- Cause: staff_id was set to DRV-00000000 before the driver UUID existed.
-- This script reassigns staff_id from each driver's id (same rule as the backend).

BEGIN;

-- 1) Preview current state
SELECT id, name, staff_id
FROM drivers
ORDER BY staff_id, name;

-- 2) Replace placeholder / missing staff IDs
UPDATE drivers
SET staff_id = 'DRV-' || UPPER(SUBSTRING(id, 1, 8))
WHERE staff_id IS NULL
   OR BTRIM(staff_id) = ''
   OR staff_id = 'DRV-00000000';

-- 3) Resolve any remaining duplicates (keep earliest id per staff_id, reassign the rest)
WITH ranked AS (
  SELECT
    id,
    staff_id,
    ROW_NUMBER() OVER (PARTITION BY staff_id ORDER BY id) AS rn
  FROM drivers
  WHERE staff_id IS NOT NULL
)
UPDATE drivers d
SET staff_id = 'DRV-' || UPPER(SUBSTRING(d.id, 1, 8))
FROM ranked r
WHERE d.id = r.id
  AND r.rn > 1;

-- 4) Verify: should return zero rows
SELECT staff_id, COUNT(*) AS cnt
FROM drivers
WHERE staff_id IS NOT NULL
GROUP BY staff_id
HAVING COUNT(*) > 1;

COMMIT;

-- Optional: show final values
SELECT id, name, staff_id
FROM drivers
ORDER BY staff_id, name;
