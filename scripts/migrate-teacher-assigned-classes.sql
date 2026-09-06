-- Link subject teachers to classes (separate from homeroom_teacher_id on classes).
-- Safe to run multiple times.

BEGIN;

CREATE TABLE IF NOT EXISTS teacher_assigned_classes (
    teacher_id VARCHAR(255) NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    class_id   VARCHAR(255) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    PRIMARY KEY (teacher_id, class_id)
);

CREATE INDEX IF NOT EXISTS idx_teacher_assigned_classes_class
    ON teacher_assigned_classes (class_id);

COMMIT;
