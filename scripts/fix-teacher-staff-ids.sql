-- Renumber teacher staff_id sequentially: ENS-00000001, ENS-00000002, …
-- Run on Neon / PostgreSQL when teacher creation fails with duplicate staff_id
-- (e.g. ENS-00000000 already exists).
--
-- Order is stable (by teacher id). Existing sequential codes are rewritten in that order.

BEGIN;

-- 1) Preview current state
SELECT id, name, staff_id
FROM teachers
ORDER BY id;

-- 2) Assign sequential codes (one per teacher, no duplicates)
WITH numbered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY id) AS seq
  FROM teachers
)
UPDATE teachers t
SET staff_id = 'ENS-' || LPAD(n.seq::text, 8, '0')
FROM numbered n
WHERE t.id = n.id;

-- 3) Verify: should return zero rows
SELECT staff_id, COUNT(*) AS cnt
FROM teachers
WHERE staff_id IS NOT NULL
GROUP BY staff_id
HAVING COUNT(*) > 1;

COMMIT;

-- Optional: show final values
SELECT id, name, staff_id
FROM teachers
ORDER BY staff_id;
