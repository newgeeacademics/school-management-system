-- =============================================================================
-- CLASS safe delete helper (PostgreSQL / Neon)
-- =============================================================================
-- Handles deep FK chains automatically — no need to rewrite scripts per table.
--
-- ONE-TIME:  Run PART 1 below (installs helper functions).
-- EVERY TIME: Edit PART 2 only — table name + UUID(s). Preview, then delete.
--
-- Do NOT use Neon table UI delete — it runs DELETE FROM one table and hits FK errors.
-- =============================================================================


-- =============================================================================
-- PART 1 — install functions (run once)
-- =============================================================================

CREATE OR REPLACE FUNCTION class_table_has_id(p_table text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = p_table
      AND column_name = 'id'
  );
$$;


CREATE OR REPLACE FUNCTION class_fk_references(p_parent_table text)
RETURNS TABLE (
  child_table text,
  child_column text,
  parent_column text,
  constraint_name text,
  is_nullable boolean
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    child_ns.nspname || '.' || child_rel.relname AS child_table,
    child_att.attname AS child_column,
    parent_att.attname AS parent_column,
    con.conname AS constraint_name,
    NOT child_att.attnotnull AS is_nullable
  FROM pg_constraint con
  JOIN pg_class child_rel ON child_rel.oid = con.conrelid
  JOIN pg_namespace child_ns ON child_ns.oid = child_rel.relnamespace
  JOIN pg_class parent_rel ON parent_rel.oid = con.confrelid
  JOIN pg_namespace parent_ns ON parent_ns.oid = parent_rel.relnamespace
  JOIN unnest(con.conkey) WITH ORDINALITY AS ck(attnum, ord) ON true
  JOIN unnest(con.confkey) WITH ORDINALITY AS fk(attnum, ord) USING (ord)
  JOIN pg_attribute child_att
    ON child_att.attrelid = con.conrelid AND child_att.attnum = ck.attnum
  JOIN pg_attribute parent_att
    ON parent_att.attrelid = con.confrelid AND parent_att.attnum = fk.attnum
  WHERE con.contype = 'f'
    AND child_ns.nspname = 'public'
    AND parent_ns.nspname = 'public'
    AND parent_rel.relname = p_parent_table
  ORDER BY child_rel.relname, child_att.attname;
$$;


CREATE OR REPLACE FUNCTION class_preview_delete(
  p_table text,
  p_ids text[]
)
RETURNS TABLE (
  depth int,
  table_name text,
  via_column text,
  row_count bigint
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  r record;
  child_ids text[];
  child_count bigint;
  bare_child text;
BEGIN
  IF p_ids IS NULL OR array_length(p_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  depth := 0;
  table_name := p_table;
  via_column := '(target)';
  row_count := array_length(p_ids, 1)::bigint;
  RETURN NEXT;

  -- Extra CLASS dependencies that may exist without a DB foreign key
  IF p_table = 'courses'
     AND EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'grade_modification_requests'
     ) THEN
    depth := 1;
    table_name := 'grade_modification_requests';
    via_column := 'evaluation_id → evaluations.course_id';
    EXECUTE $q$
      SELECT COUNT(*) FROM grade_modification_requests
      WHERE evaluation_id IN (SELECT id FROM evaluations WHERE course_id = ANY($1))
    $q$ INTO row_count USING p_ids;
    IF row_count > 0 THEN RETURN NEXT; END IF;

    depth := 1;
    table_name := 'student_grades';
    via_column := 'evaluation_id → evaluations.course_id';
    EXECUTE $q$
      SELECT COUNT(*) FROM student_grades
      WHERE evaluation_id IN (SELECT id FROM evaluations WHERE course_id = ANY($1))
    $q$ INTO row_count USING p_ids;
    IF row_count > 0 THEN RETURN NEXT; END IF;

    depth := 1;
    table_name := 'evaluations';
    via_column := 'course_id';
    EXECUTE 'SELECT COUNT(*) FROM evaluations WHERE course_id = ANY($1)'
      INTO row_count USING p_ids;
    IF row_count > 0 THEN RETURN NEXT; END IF;
  END IF;

  IF p_table = 'app_users'
     AND EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'grade_modification_requests'
     ) THEN
    depth := 1;
    table_name := 'grade_modification_requests';
    via_column := 'reviewed_by_user_id';
    EXECUTE 'SELECT COUNT(*) FROM grade_modification_requests WHERE reviewed_by_user_id = ANY($1)'
      INTO row_count USING p_ids;
    IF row_count > 0 THEN RETURN NEXT; END IF;
  END IF;

  IF p_table = 'drivers'
     AND EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'transport_routes'
     )
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'transport_routes' AND column_name = 'driver_id'
     ) THEN
    depth := 1;
    table_name := 'transport_routes';
    via_column := 'driver_id';
    EXECUTE 'SELECT COUNT(*) FROM transport_routes WHERE driver_id = ANY($1)'
      INTO row_count USING p_ids;
    IF row_count > 0 THEN RETURN NEXT; END IF;
  END IF;

  FOR r IN SELECT * FROM class_fk_references(p_table) LOOP
    bare_child := split_part(r.child_table, '.', 2);

    IF class_table_has_id(bare_child) THEN
      EXECUTE format(
        'SELECT array_agg(DISTINCT id::text) FROM %I WHERE %I = ANY($1)',
        bare_child, r.child_column
      ) INTO child_ids USING p_ids;

      IF child_ids IS NOT NULL THEN
        RETURN QUERY
        SELECT p.depth + 1, p.table_name, p.via_column, p.row_count
        FROM class_preview_delete(bare_child, child_ids) p;
      END IF;
    ELSE
      EXECUTE format(
        'SELECT COUNT(*) FROM %I WHERE %I = ANY($1)',
        bare_child, r.child_column
      ) INTO child_count USING p_ids;

      IF child_count > 0 THEN
        depth := 1;
        table_name := bare_child;
        via_column := r.child_column;
        row_count := child_count;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
END;
$$;


CREATE OR REPLACE FUNCTION class_safe_delete(
  p_table text,
  p_ids text[],
  p_unlink_nullable boolean DEFAULT false
)
RETURNS TABLE (
  action text,
  table_name text,
  rows_affected bigint
)
LANGUAGE plpgsql
AS $$
DECLARE
  r record;
  child_ids text[];
  app_user_ids text[];
  bare_child text;
  n bigint;
BEGIN
  IF p_ids IS NULL OR array_length(p_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  -- Extra CLASS dependencies without FK constraints in some DB branches
  IF p_table = 'evaluations'
     AND EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'grade_modification_requests'
     ) THEN
    DELETE FROM grade_modification_requests WHERE evaluation_id = ANY(p_ids);
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n > 0 THEN action := 'DELETE'; table_name := 'grade_modification_requests'; rows_affected := n; RETURN NEXT; END IF;
  END IF;

  IF p_table = 'courses'
     AND EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'grade_modification_requests'
     ) THEN
    DELETE FROM grade_modification_requests
    WHERE evaluation_id IN (SELECT id FROM evaluations WHERE course_id = ANY(p_ids));
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n > 0 THEN action := 'DELETE'; table_name := 'grade_modification_requests'; rows_affected := n; RETURN NEXT; END IF;

    DELETE FROM student_grades
    WHERE evaluation_id IN (SELECT id FROM evaluations WHERE course_id = ANY(p_ids));
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n > 0 THEN action := 'DELETE'; table_name := 'student_grades'; rows_affected := n; RETURN NEXT; END IF;

    DELETE FROM evaluations WHERE course_id = ANY(p_ids);
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n > 0 THEN action := 'DELETE'; table_name := 'evaluations'; rows_affected := n; RETURN NEXT; END IF;
  END IF;

  IF p_table = 'app_users'
     AND EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'grade_modification_requests'
     ) THEN
    UPDATE grade_modification_requests SET reviewed_by_user_id = NULL
    WHERE reviewed_by_user_id = ANY(p_ids);
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n > 0 THEN action := 'UNLINK'; table_name := 'grade_modification_requests'; rows_affected := n; RETURN NEXT; END IF;
  END IF;

  IF p_table = 'drivers'
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'transport_routes' AND column_name = 'driver_id'
     ) THEN
    IF p_unlink_nullable THEN
      UPDATE transport_routes SET driver_id = NULL WHERE driver_id = ANY(p_ids);
      GET DIAGNOSTICS n = ROW_COUNT;
      IF n > 0 THEN action := 'UNLINK'; table_name := 'transport_routes'; rows_affected := n; RETURN NEXT; END IF;
    ELSE
      -- cascade delete routes (and their trips / waypoints / students via FK graph)
      EXECUTE 'SELECT array_agg(DISTINCT id::text) FROM transport_routes WHERE driver_id = ANY($1)'
        INTO child_ids USING p_ids;
      IF child_ids IS NOT NULL THEN
        RETURN QUERY SELECT * FROM class_safe_delete('transport_routes', child_ids, p_unlink_nullable);
      END IF;
    END IF;
  END IF;

  FOR r IN SELECT * FROM class_fk_references(p_table) LOOP
    bare_child := split_part(r.child_table, '.', 2);

    IF p_unlink_nullable AND r.is_nullable THEN
      EXECUTE format(
        'UPDATE %I SET %I = NULL WHERE %I = ANY($1)',
        bare_child, r.child_column, r.child_column
      ) USING p_ids;
      GET DIAGNOSTICS n = ROW_COUNT;
      IF n > 0 THEN
        action := 'UNLINK';
        table_name := bare_child;
        rows_affected := n;
        RETURN NEXT;
      END IF;
    ELSIF class_table_has_id(bare_child) THEN
      EXECUTE format(
        'SELECT array_agg(DISTINCT id::text) FROM %I WHERE %I = ANY($1)',
        bare_child, r.child_column
      ) INTO child_ids USING p_ids;

      IF child_ids IS NOT NULL THEN
        RETURN QUERY SELECT * FROM class_safe_delete(bare_child, child_ids, p_unlink_nullable);
      END IF;
    ELSE
      EXECUTE format(
        'DELETE FROM %I WHERE %I = ANY($1)',
        bare_child, r.child_column
      ) USING p_ids;
      GET DIAGNOSTICS n = ROW_COUNT;
      IF n > 0 THEN
        action := 'DELETE';
        table_name := bare_child;
        rows_affected := n;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;

  IF p_table = 'drivers' THEN
    EXECUTE
      'SELECT array_agg(DISTINCT app_user_id::text) FROM drivers WHERE id = ANY($1) AND app_user_id IS NOT NULL'
      INTO app_user_ids USING p_ids;
  END IF;

  EXECUTE format('DELETE FROM %I WHERE id = ANY($1)', p_table) USING p_ids;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n > 0 THEN
    action := 'DELETE';
    table_name := p_table;
    rows_affected := n;
    RETURN NEXT;
  END IF;

  IF app_user_ids IS NOT NULL THEN
    DELETE FROM app_users WHERE id = ANY(app_user_ids);
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n > 0 THEN
      action := 'DELETE';
      table_name := 'app_users';
      rows_affected := n;
      RETURN NEXT;
    END IF;
  END IF;
END;
$$;


-- =============================================================================
-- PART 2 — USE THIS EVERY TIME (edit table + ids only; no new scripts needed)
-- =============================================================================
--
-- Cheat sheet — p_unlink_nullable:
--   false → courses, classes, students, teachers, matieres, transport_routes
--   true  → app_users, drivers (unlink nullable FKs; keeps routes / staff rows)
--
-- Step A: PREVIEW (safe, run first)
-- Step B: DELETE (uncomment BEGIN…COMMIT block)

-- ── Step A: PREVIEW ──────────────────────────────────────────────────────────
SELECT * FROM class_preview_delete(
  'drivers',                    -- ← table name
  ARRAY[
    '80bdf2b1-ab2d-4c14-b630-14180b79d0da'  -- ← row id(s)
  ]
) ORDER BY depth, table_name;

-- ── Step B: DELETE ───────────────────────────────────────────────────────────
/*
BEGIN;

SELECT * FROM class_safe_delete(
  'drivers',                    -- ← same table name
  ARRAY[
    '80bdf2b1-ab2d-4c14-b630-14180b79d0da'  -- ← same row id(s)
  ],
  true                          -- ← false = cascade | true = unlink (app_users, drivers)
);

COMMIT;
-- ROLLBACK;
*/
