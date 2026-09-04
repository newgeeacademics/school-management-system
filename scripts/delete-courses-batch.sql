-- Delete 16 courses + ALL dependents (PostgreSQL / Neon)
-- Paste the whole block below into Neon SQL Editor and Run.
-- Do NOT use the table UI delete button — it only runs DELETE FROM courses.

BEGIN;

-- 1) grade change requests (if table exists)
DELETE FROM grade_modification_requests
WHERE evaluation_id IN (
  SELECT id FROM evaluations WHERE course_id IN (
    '13bf78b1-bbeb-4710-8a3b-e66cf38e1922','1ea69171-bab3-4769-8a85-8772d1399479',
    '372abbb9-30bf-49bf-899d-2d5a9bceeca8','44135c7b-bb9c-4fe7-93fa-78712b370cde',
    '5055ff7f-9cfa-487a-bd25-09707a464979','7971d464-590f-43ac-b731-2a7630d99c3f',
    '97e54633-0f0d-41d2-a737-48d517618b9c','99f0c5e2-61b4-496b-843c-b817f17c82e1',
    'a54a4649-76b6-4699-acfa-b26752d56f18','c5aa7dba-5698-466d-9c62-d76fe8bf6859',
    'cda55c19-7a3e-4776-9335-15bbc7bb360f','d40e1cdc-68f0-4db0-8de6-c301cc4bb1d9',
    'd8521585-4a05-4c5a-81fb-ab29fa03c930','df41ecf2-c4ce-4234-90ad-0e0d90af8944',
    'df5253d3-665a-4bdc-af0a-31ee517ca8fd','ee1aa799-ceae-47b2-a723-4cd156b94780'
  )
);

-- 2) student grades
DELETE FROM student_grades
WHERE evaluation_id IN (
  SELECT id FROM evaluations WHERE course_id IN (
    '13bf78b1-bbeb-4710-8a3b-e66cf38e1922','1ea69171-bab3-4769-8a85-8772d1399479',
    '372abbb9-30bf-49bf-899d-2d5a9bceeca8','44135c7b-bb9c-4fe7-93fa-78712b370cde',
    '5055ff7f-9cfa-487a-bd25-09707a464979','7971d464-590f-43ac-b731-2a7630d99c3f',
    '97e54633-0f0d-41d2-a737-48d517618b9c','99f0c5e2-61b4-496b-843c-b817f17c82e1',
    'a54a4649-76b6-4699-acfa-b26752d56f18','c5aa7dba-5698-466d-9c62-d76fe8bf6859',
    'cda55c19-7a3e-4776-9335-15bbc7bb360f','d40e1cdc-68f0-4db0-8de6-c301cc4bb1d9',
    'd8521585-4a05-4c5a-81fb-ab29fa03c930','df41ecf2-c4ce-4234-90ad-0e0d90af8944',
    'df5253d3-665a-4bdc-af0a-31ee517ca8fd','ee1aa799-ceae-47b2-a723-4cd156b94780'
  )
);

-- 3) evaluations
DELETE FROM evaluations WHERE course_id IN (
  '13bf78b1-bbeb-4710-8a3b-e66cf38e1922','1ea69171-bab3-4769-8a85-8772d1399479',
  '372abbb9-30bf-49bf-899d-2d5a9bceeca8','44135c7b-bb9c-4fe7-93fa-78712b370cde',
  '5055ff7f-9cfa-487a-bd25-09707a464979','7971d464-590f-43ac-b731-2a7630d99c3f',
  '97e54633-0f0d-41d2-a737-48d517618b9c','99f0c5e2-61b4-496b-843c-b817f17c82e1',
  'a54a4649-76b6-4699-acfa-b26752d56f18','c5aa7dba-5698-466d-9c62-d76fe8bf6859',
  'cda55c19-7a3e-4776-9335-15bbc7bb360f','d40e1cdc-68f0-4db0-8de6-c301cc4bb1d9',
  'd8521585-4a05-4c5a-81fb-ab29fa03c930','df41ecf2-c4ce-4234-90ad-0e0d90af8944',
  'df5253d3-665a-4bdc-af0a-31ee517ca8fd','ee1aa799-ceae-47b2-a723-4cd156b94780'
);

-- 4) timetable slots — THIS is what blocked your delete
DELETE FROM schedule_items WHERE course_id IN (
  '13bf78b1-bbeb-4710-8a3b-e66cf38e1922','1ea69171-bab3-4769-8a85-8772d1399479',
  '372abbb9-30bf-49bf-899d-2d5a9bceeca8','44135c7b-bb9c-4fe7-93fa-78712b370cde',
  '5055ff7f-9cfa-487a-bd25-09707a464979','7971d464-590f-43ac-b731-2a7630d99c3f',
  '97e54633-0f0d-41d2-a737-48d517618b9c','99f0c5e2-61b4-496b-843c-b817f17c82e1',
  'a54a4649-76b6-4699-acfa-b26752d56f18','c5aa7dba-5698-466d-9c62-d76fe8bf6859',
  'cda55c19-7a3e-4776-9335-15bbc7bb360f','d40e1cdc-68f0-4db0-8de6-c301cc4bb1d9',
  'd8521585-4a05-4c5a-81fb-ab29fa03c930','df41ecf2-c4ce-4234-90ad-0e0d90af8944',
  'df5253d3-665a-4bdc-af0a-31ee517ca8fd','ee1aa799-ceae-47b2-a723-4cd156b94780'
);

-- 5) courses
DELETE FROM courses WHERE id IN (
  '13bf78b1-bbeb-4710-8a3b-e66cf38e1922','1ea69171-bab3-4769-8a85-8772d1399479',
  '372abbb9-30bf-49bf-899d-2d5a9bceeca8','44135c7b-bb9c-4fe7-93fa-78712b370cde',
  '5055ff7f-9cfa-487a-bd25-09707a464979','7971d464-590f-43ac-b731-2a7630d99c3f',
  '97e54633-0f0d-41d2-a737-48d517618b9c','99f0c5e2-61b4-496b-843c-b817f17c82e1',
  'a54a4649-76b6-4699-acfa-b26752d56f18','c5aa7dba-5698-466d-9c62-d76fe8bf6859',
  'cda55c19-7a3e-4776-9335-15bbc7bb360f','d40e1cdc-68f0-4db0-8de6-c301cc4bb1d9',
  'd8521585-4a05-4c5a-81fb-ab29fa03c930','df41ecf2-c4ce-4234-90ad-0e0d90af8944',
  'df5253d3-665a-4bdc-af0a-31ee517ca8fd','ee1aa799-ceae-47b2-a723-4cd156b94780'
);

COMMIT;
-- ROLLBACK;  -- use instead of COMMIT to undo
