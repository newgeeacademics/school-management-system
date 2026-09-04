-- Delete app_users safely (PostgreSQL / Neon)
-- Prefer: scripts/safe-delete.sql (handles any depth automatically)
--
-- FIRST TIME ONLY: run PART 1 of safe-delete.sql to install helper functions.
-- Mode: unlink nullable FKs (keeps teacher/student/parent/driver rows).

-- =============================================================================
-- PREVIEW — linked rows for these app_user ids
-- =============================================================================
SELECT * FROM class_preview_delete(
  'app_users',
  ARRAY[
    '00aca2fc-e12d-4172-a35d-b21a3ea927ea',
    '116a0b91-0bbc-4f98-ae4f-9626cbac3f7e',
    '1c171634-e137-4e4d-a8da-4b33fce9af2c',
    '2e878813-98b6-4240-b859-9ad6c4db7d78',
    '31e43501-3c3b-41b1-a08e-e81d395af201',
    '3ef76183-1bdf-4fca-94ff-ba8e9dbd7373',
    '439791fc-7fee-435f-9458-0fdfd696f4fa',
    '57a1b58d-7e14-4416-b2c9-50edec595cfd',
    '5d4c83d2-8853-4179-949f-f5f96faad5ea',
    '64053184-2cbb-4744-abd6-6496b5138dbf',
    '73ec4ae0-f420-46ff-8ac6-f45aac778ab3',
    '784befdc-75a7-42be-a91c-89e718e63993',
    '837b37c2-f8d8-4b41-bfc0-1a2cbb920bf1',
    '876f39ce-3c88-4644-803b-172bc54d6b86',
    '9c242826-7ca6-446a-8dc1-5a5a0ea7ff33',
    'bb9a3cb6-45df-444c-9a01-d375d20b355e',
    'c8cd57bd-9729-4c74-a206-d0dfd471e4c9',
    'd399b628-e913-4e5d-9747-a9aa0fbe2c0a',
    'dc490810-af86-4824-980f-e738e009a459',
    'f951ea5c-57a3-405d-86d2-7c12edbd077e',
    'fb00d6b3-4ca4-47f8-8c4b-cfb1fa9a80ac',
    'fd40d3eb-21d3-4356-8018-ea8a72a6693d'
  ]
) ORDER BY depth, table_name;

-- =============================================================================
-- DELETE — uncomment and run this whole block (BEGIN through COMMIT)
-- =============================================================================

/*
BEGIN;

SELECT * FROM class_safe_delete(
  'app_users',
  ARRAY[
    '00aca2fc-e12d-4172-a35d-b21a3ea927ea',
    '116a0b91-0bbc-4f98-ae4f-9626cbac3f7e',
    '1c171634-e137-4e4d-a8da-4b33fce9af2c',
    '2e878813-98b6-4240-b859-9ad6c4db7d78',
    '31e43501-3c3b-41b1-a08e-e81d395af201',
    '3ef76183-1bdf-4fca-94ff-ba8e9dbd7373',
    '439791fc-7fee-435f-9458-0fdfd696f4fa',
    '57a1b58d-7e14-4416-b2c9-50edec595cfd',
    '5d4c83d2-8853-4179-949f-f5f96faad5ea',
    '64053184-2cbb-4744-abd6-6496b5138dbf',
    '73ec4ae0-f420-46ff-8ac6-f45aac778ab3',
    '784befdc-75a7-42be-a91c-89e718e63993',
    '837b37c2-f8d8-4b41-bfc0-1a2cbb920bf1',
    '876f39ce-3c88-4644-803b-172bc54d6b86',
    '9c242826-7ca6-446a-8dc1-5a5a0ea7ff33',
    'bb9a3cb6-45df-444c-9a01-d375d20b355e',
    'c8cd57bd-9729-4c74-a206-d0dfd471e4c9',
    'd399b628-e913-4e5d-9747-a9aa0fbe2c0a',
    'dc490810-af86-4824-980f-e738e009a459',
    'f951ea5c-57a3-405d-86d2-7c12edbd077e',
    'fb00d6b3-4ca4-47f8-8c4b-cfb1fa9a80ac',
    'fd40d3eb-21d3-4356-8018-ea8a72a6693d'
  ],
  true
);

COMMIT;
-- ROLLBACK;
*/
