package com.classroom.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.classroom.backend.model.enums.SchoolType;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Keeps the schools table in line with SchoolType, and assigns legacy rows to a school.
 * <p>
 * Messages and announcements created before school scoping have no school_id.
 * When the database holds a single establishment they clearly belong to it; with several
 * establishments they stay unassigned (hidden) rather than being shown to every school.
 * Legacy subjects are backfilled the same way; with several establishments they stay shared
 * (visible to every school) because existing courses still point at them.
 * Legacy drivers and transport routes take their school from the driver's account, the route's
 * driver or the route's pupils when that is unambiguous; otherwise, with a single establishment,
 * they go to it, and with several they stay unassigned (hidden).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SchoolScopeMigration {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    /** Hibernate does not refresh the enum CHECK constraint, so new SchoolType values would be rejected. */
    @EventListener(ApplicationReadyEvent.class)
    public void allowAllSchoolTypes() {
        if (!isPostgres()) {
            return;
        }
        try {
            String allowed = Arrays.stream(SchoolType.values())
                    .map(type -> "'" + type.name() + "'")
                    .collect(Collectors.joining(", "));
            jdbcTemplate.execute("ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_type_check");
            jdbcTemplate.execute("ALTER TABLE schools ADD CONSTRAINT schools_type_check CHECK (type IN (" + allowed + "))");
        } catch (Exception e) {
            log.warn("Could not refresh schools.type constraint: {}", e.getMessage());
        }
    }

    private boolean isPostgres() {
        try (Connection connection = dataSource.getConnection()) {
            return "PostgreSQL".equals(connection.getMetaData().getDatabaseProductName());
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Subject names used to be unique across the whole platform, so a second school could not
     * create "Mathématiques". Names are now unique per school (checked in MatiereService).
     */
    @EventListener(ApplicationReadyEvent.class)
    public void dropPlatformWideSubjectNameUnique() {
        if (!isPostgres()) {
            return;
        }
        try {
            List<String> constraints = jdbcTemplate.queryForList(
                    "SELECT tc.constraint_name FROM information_schema.table_constraints tc "
                            + "JOIN information_schema.constraint_column_usage ccu "
                            + "ON tc.constraint_name = ccu.constraint_name AND tc.table_name = ccu.table_name "
                            + "WHERE tc.table_name = 'matieres' AND tc.constraint_type = 'UNIQUE' "
                            + "AND ccu.column_name = 'name'",
                    String.class);
            for (String constraint : constraints) {
                jdbcTemplate.execute("ALTER TABLE matieres DROP CONSTRAINT IF EXISTS \"" + constraint.replace("\"", "") + "\"");
                log.info("Dropped platform-wide unique constraint {} on matieres.name", constraint);
            }
        } catch (Exception e) {
            log.warn("Could not drop unique constraint on matieres.name: {}", e.getMessage());
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void backfillLegacySchoolIds() {
        try {
            List<String> schoolIds = jdbcTemplate.queryForList("SELECT id FROM schools", String.class);
            if (schoolIds.size() != 1) {
                return;
            }
            String schoolId = schoolIds.get(0);
            int messages = jdbcTemplate.update(
                    "UPDATE school_messages SET school_id = ? WHERE school_id IS NULL", schoolId);
            int announcements = jdbcTemplate.update(
                    "UPDATE announcements SET school_id = ? WHERE school_id IS NULL", schoolId);
            jdbcTemplate.update("UPDATE matieres SET school_id = ? WHERE school_id IS NULL", schoolId);
            if (messages + announcements > 0) {
                log.info("Assigned {} message(s) and {} announcement(s) to school {}", messages, announcements, schoolId);
            }
        } catch (Exception e) {
            log.warn("Could not backfill school_id on messages/announcements: {}", e.getMessage());
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void backfillTransportSchoolIds() {
        try {
            int drivers = jdbcTemplate.update(
                    "UPDATE drivers SET school_id = (SELECT u.school_id FROM app_users u WHERE u.id = drivers.app_user_id) "
                            + "WHERE school_id IS NULL AND app_user_id IS NOT NULL");
            int routes = jdbcTemplate.update(
                    "UPDATE transport_routes SET school_id = (SELECT d.school_id FROM drivers d WHERE d.id = transport_routes.driver_id) "
                            + "WHERE school_id IS NULL AND driver_id IS NOT NULL");
            routes += jdbcTemplate.update(
                    "UPDATE transport_routes SET school_id = ("
                            + "SELECT MIN(s.school_id) FROM transport_route_students trs JOIN students s ON s.id = trs.student_id "
                            + "WHERE trs.route_id = transport_routes.id) "
                            + "WHERE school_id IS NULL AND (SELECT COUNT(DISTINCT s.school_id) FROM transport_route_students trs "
                            + "JOIN students s ON s.id = trs.student_id WHERE trs.route_id = transport_routes.id) = 1");

            List<String> schoolIds = jdbcTemplate.queryForList("SELECT id FROM schools", String.class);
            if (schoolIds.size() == 1) {
                String schoolId = schoolIds.get(0);
                drivers += jdbcTemplate.update("UPDATE drivers SET school_id = ? WHERE school_id IS NULL", schoolId);
                routes += jdbcTemplate.update("UPDATE transport_routes SET school_id = ? WHERE school_id IS NULL", schoolId);
            }
            if (drivers + routes > 0) {
                log.info("Assigned a school to {} driver(s) and {} transport route(s)", drivers, routes);
            }
        } catch (Exception e) {
            log.warn("Could not backfill school_id on drivers/transport routes: {}", e.getMessage());
        }
    }
}
