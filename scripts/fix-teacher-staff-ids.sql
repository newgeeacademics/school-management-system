-- Fix duplicate teacher staff_id values (e.g. ENS-00000000).
-- Run on Neon / PostgreSQL when teacher creation fails with:
--   duplicate key value violates unique constraint "ukhwllts0elb03lqv7yenjhk3dt"
--   Key (staff_id)=(ENS-00000000) already exists.
--
-- Cause: staff_id was set to ENS-00000000 before the teacher UUID existed.
-- This script reassigns staff_id from each teacher's id (same rule as the backend).

BEGIN;

-- 1) Preview current state
SELECT id, name, staff_id
FROM teachers
ORDER BY staff_id, name;

-- 2) Replace placeholder / missing staff IDs
UPDATE teachers
SET staff_id = 'ENS-' || UPPER(SUBSTRING(id, 1, 8))
WHERE staff_id IS NULL
   OR BTRIM(staff_id) = ''
   OR staff_id = 'ENS-00000000';

-- 3) Resolve any remaining duplicates (keep earliest id per staff_id, reassign the rest)
WITH ranked AS (
  SELECT
    id,
    staff_id,
    ROW_NUMBER() OVER (PARTITION BY staff_id ORDER BY id) AS rn
  FROM teachers
  WHERE staff_id IS NOT NULL
)
UPDATE teachers t
SET staff_id = 'ENS-' || UPPER(SUBSTRING(t.id, 1, 8))
FROM ranked r
WHERE t.id = r.id
  AND r.rn > 1;

-- 4) Verify: should return zero rows
SELECT staff_id, COUNT(*) AS cnt
FROM teachers
WHERE staff_id IS NOT NULL
GROUP BY staff_id
HAVING COUNT(*) > 1;

COMMIT;

-- Optional: show final values
SELECT id, name, staff_id
FROM teachers
ORDER BY staff_id, name;
