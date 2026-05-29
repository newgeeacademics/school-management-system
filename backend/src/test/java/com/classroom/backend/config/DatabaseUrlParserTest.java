package com.classroom.backend.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DatabaseUrlParserTest {

    @Test
    void parse_neonStyleUrl() {
        String url = "postgresql://user:secret@ep-host.neon.tech/neondb?sslmode=require";
        DatabaseUrlParser.Parsed parsed = DatabaseUrlParser.parse(url);

        assertEquals("jdbc:postgresql://ep-host.neon.tech/neondb?sslmode=require", parsed.jdbcUrl());
        assertEquals("user", parsed.username());
        assertEquals("secret", parsed.password());
    }

    @Test
    void parse_jdbcUrlPassthrough() {
        String url = "jdbc:postgresql://localhost:5432/test";
        DatabaseUrlParser.Parsed parsed = DatabaseUrlParser.parse(url);
        assertEquals(url, parsed.jdbcUrl());
    }
}
