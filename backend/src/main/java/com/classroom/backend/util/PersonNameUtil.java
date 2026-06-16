package com.classroom.backend.util;

public final class PersonNameUtil {

    private PersonNameUtil() {
    }

    public static String resolveFullName(String firstName, String lastName, String legacyName) {
        String first = trim(firstName);
        String last = trim(lastName);
        if (!first.isEmpty() || !last.isEmpty()) {
            return (first + " " + last).trim();
        }
        return trim(legacyName);
    }

    public static String trim(String value) {
        return value == null ? "" : value.trim();
    }

    public static String requireFullName(String firstName, String lastName, String legacyName) {
        String full = resolveFullName(firstName, lastName, legacyName);
        if (full.isBlank()) {
            throw new IllegalArgumentException("Prénom et nom sont requis");
        }
        return full;
    }

    public static boolean hasFirstAndLast(String firstName, String lastName) {
        return !trim(firstName).isEmpty() && !trim(lastName).isEmpty();
    }
}
