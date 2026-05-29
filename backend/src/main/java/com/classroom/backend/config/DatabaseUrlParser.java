package com.classroom.backend.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * Parses PostgreSQL connection URLs (e.g. Neon / Render DATABASE_URL).
 * Supports {@code postgresql://user:pass@host/db?sslmode=require} format.
 */
public final class DatabaseUrlParser {

    private DatabaseUrlParser() {}

    public record Parsed(String jdbcUrl, String username, String password) {}

    public static Parsed parse(String databaseUrl) {
        if (databaseUrl == null || databaseUrl.isBlank()) {
            throw new IllegalArgumentException("DATABASE_URL is empty");
        }

        if (databaseUrl.startsWith("jdbc:")) {
            return new Parsed(databaseUrl, null, null);
        }

        URI uri = URI.create(databaseUrl);
        String userInfo = uri.getUserInfo();
        if (userInfo == null || userInfo.isBlank()) {
            throw new IllegalArgumentException("DATABASE_URL must include credentials");
        }

        String[] credentials = userInfo.split(":", 2);
        String username = decode(credentials[0]);
        String password = credentials.length > 1 ? decode(credentials[1]) : "";

        String host = uri.getHost();
        int port = uri.getPort();
        String path = uri.getPath() != null ? uri.getPath() : "";
        String query = uri.getQuery() != null ? "?" + uri.getQuery() : "";

        String jdbcUrl = "jdbc:postgresql://" + host
                + (port > 0 ? ":" + port : "")
                + path
                + query;

        return new Parsed(jdbcUrl, username, password);
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
