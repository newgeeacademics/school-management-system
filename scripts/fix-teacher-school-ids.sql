-- Backfill teachers.school_id so each teacher belongs to one establishment.
-- Run on Neon after deploying school-scoping fixes.

BEGIN;

-- 1) From homeroom class (most reliable for existing data)
UPDATE teachers t
SET school_id = c.school_id
FROM class_items c
WHERE c.homeroom_teacher_id = t.id
  AND (t.school_id IS NULL OR BTRIM(t.school_id) = '')
  AND c.school_id IS NOT NULL;

-- 2) From linked portal account (fallback)
UPDATE teachers t
SET school_id = u.school_id
FROM app_users u
WHERE u.id = t.app_user_id
  AND (t.school_id IS NULL OR BTRIM(t.school_id) = '')
  AND u.school_id IS NOT NULL;

-- 3) Unlink homeroom when teacher and class are from different schools
UPDATE class_items c
SET homeroom_teacher_id = NULL
FROM teachers t
WHERE c.homeroom_teacher_id = t.id
  AND c.school_id IS NOT NULL
  AND t.school_id IS NOT NULL
  AND c.school_id <> t.school_id;

-- 4) Preview teachers still without a school (fix manually in dashboard)
SELECT t.id, t.name, t.staff_id, t.email
FROM teachers t
WHERE t.school_id IS NULL OR BTRIM(t.school_id) = '';

COMMIT;
