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
            if (messages + announcements > 0) {
                log.info("Assigned {} message(s) and {} announcement(s) to school {}", messages, announcements, schoolId);
            }
        } catch (Exception e) {
            log.warn("Could not backfill school_id on messages/announcements: {}", e.getMessage());
        }
    }
}
