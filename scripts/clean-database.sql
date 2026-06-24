-- Wipes all application data from the public schema (Neon / PostgreSQL).
-- Tables are recreated by Hibernate on next backend start (ddl-auto: update).
DO $truncate$
DECLARE
  tables text;
BEGIN
  SELECT string_agg(format('%I.%I', schemaname, tablename), ', ')
    INTO tables
    FROM pg_tables
    WHERE schemaname = 'public';

  IF tables IS NOT NULL THEN
    EXECUTE 'TRUNCATE TABLE ' || tables || ' RESTART IDENTITY CASCADE';
  END IF;
END;
$truncate$;
