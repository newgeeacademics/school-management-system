-- Delete 3 classes + ALL dependents (PostgreSQL / Neon)
-- Paste the whole block below into Neon SQL Editor and Run.
-- Do NOT use the table UI delete button — it only runs DELETE FROM classes.

BEGIN;

-- 1) grade change requests (skip this statement if table does not exist)
DELETE FROM grade_modification_requests
WHERE evaluation_id IN (
  SELECT id FROM evaluations WHERE class_id IN (
    '323aeff9-d4f9-48bf-9937-e1624680248e',
    'd21450e4-9d11-42ef-8a4a-831e46cf5c74',
    'f3894211-cb6d-447b-b9d4-ee9338b52c6d'
  )
)
OR student_id IN (
  SELECT id FROM students WHERE class_id IN (
    '323aeff9-d4f9-48bf-9937-e1624680248e',
    'd21450e4-9d11-42ef-8a4a-831e46cf5c74',
    'f3894211-cb6d-447b-b9d4-ee9338b52c6d'
  )
);

-- 2) student grades
DELETE FROM student_grades
WHERE evaluation_id IN (
  SELECT id FROM evaluations WHERE class_id IN (
    '323aeff9-d4f9-48bf-9937-e1624680248e',
    'd21450e4-9d11-42ef-8a4a-831e46cf5c74',
    'f3894211-cb6d-447b-b9d4-ee9338b52c6d'
  )
)
OR student_id IN (
  SELECT id FROM students WHERE class_id IN (
    '323aeff9-d4f9-48bf-9937-e1624680248e',
    'd21450e4-9d11-42ef-8a4a-831e46cf5c74',
    'f3894211-cb6d-447b-b9d4-ee9338b52c6d'
  )
);

-- 3) attendance
DELETE FROM attendance_records
WHERE class_id IN (
  '323aeff9-d4f9-48bf-9937-e1624680248e',
  'd21450e4-9d11-42ef-8a4a-831e46cf5c74',
  'f3894211-cb6d-447b-b9d4-ee9338b52c6d'
)
OR student_id IN (
  SELECT id FROM students WHERE class_id IN (
    '323aeff9-d4f9-48bf-9937-e1624680248e',
    'd21450e4-9d11-42ef-8a4a-831e46cf5c74',
    'f3894211-cb6d-447b-b9d4-ee9338b52c6d'
  )
);

-- 4) evaluations
DELETE FROM evaluations WHERE class_id IN (
  '323aeff9-d4f9-48bf-9937-e1624680248e',
  'd21450e4-9d11-42ef-8a4a-831e46cf5c74',
  'f3894211-cb6d-447b-b9d4-ee9338b52c6d'
);

-- 5) homework
DELETE FROM homework_assignments WHERE class_id IN (
  '323aeff9-d4f9-48bf-9937-e1624680248e',
  'd21450e4-9d11-42ef-8a4a-831e46cf5c74',
  'f3894211-cb6d-447b-b9d4-ee9338b52c6d'
);

-- 6) timetable slots — THIS blocked your delete
DELETE FROM schedule_items WHERE class_id IN (
  '323aeff9-d4f9-48bf-9937-e1624680248e',
  'd21450e4-9d11-42ef-8a4a-831e46cf5c74',
  'f3894211-cb6d-447b-b9d4-ee9338b52c6d'
);

-- 7) parent links + bus route assignments for students in these classes
DELETE FROM parent_contacts
WHERE student_id IN (
  SELECT id FROM students WHERE class_id IN (
    '323aeff9-d4f9-48bf-9937-e1624680248e',
    'd21450e4-9d11-42ef-8a4a-831e46cf5c74',
    'f3894211-cb6d-447b-b9d4-ee9338b52c6d'
  )
);

DELETE FROM transport_route_students
WHERE student_id IN (
  SELECT id FROM students WHERE class_id IN (
    '323aeff9-d4f9-48bf-9937-e1624680248e',
    'd21450e4-9d11-42ef-8a4a-831e46cf5c74',
    'f3894211-cb6d-447b-b9d4-ee9338b52c6d'
  )
);

-- 8) students
DELETE FROM students WHERE class_id IN (
  '323aeff9-d4f9-48bf-9937-e1624680248e',
  'd21450e4-9d11-42ef-8a4a-831e46cf5c74',
  'f3894211-cb6d-447b-b9d4-ee9338b52c6d'
);

-- 9) classes
DELETE FROM classes WHERE id IN (
  '323aeff9-d4f9-48bf-9937-e1624680248e',
  'd21450e4-9d11-42ef-8a4a-831e46cf5c74',
  'f3894211-cb6d-447b-b9d4-ee9338b52c6d'
);

COMMIT;
-- ROLLBACK;
