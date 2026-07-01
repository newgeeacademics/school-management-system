package com.classroom.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

/**
 * Hibernate ddl-auto=update does not always refresh PostgreSQL CHECK constraints.
 * Ensures STAFF is allowed for driver tracker accounts.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AppUserSchemaMigration {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    @EventListener(ApplicationReadyEvent.class)
    public void ensureStaffRoleAllowed() {
        if (!isPostgres()) {
            return;
        }
        try {
            jdbcTemplate.execute("ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_role_check");
            jdbcTemplate.execute(
                    "ALTER TABLE app_users ADD CONSTRAINT app_users_role_check "
                            + "CHECK (role IN ('ADMIN', 'TEACHER', 'PARENT', 'STUDENT', 'STAFF'))");
            jdbcTemplate.execute("ALTER TABLE app_users ADD COLUMN IF NOT EXISTS login_id character varying(255)");
            jdbcTemplate.execute(
                    "CREATE UNIQUE INDEX IF NOT EXISTS uk_app_users_login_id ON app_users (login_id) "
                            + "WHERE login_id IS NOT NULL");
            jdbcTemplate.execute(
                    "ALTER TABLE schedule_items ADD COLUMN IF NOT EXISTS teacher_id character varying(255)");
            log.info("app_users schema verified (STAFF role + login_id)");
        } catch (Exception e) {
            log.warn("Could not patch app_users role constraint: {}", e.getMessage());
        }
    }

    private boolean isPostgres() {
        try (Connection connection = dataSource.getConnection()) {
            return "PostgreSQL".equals(connection.getMetaData().getDatabaseProductName());
        } catch (Exception e) {
            return false;
        }
    }
}
