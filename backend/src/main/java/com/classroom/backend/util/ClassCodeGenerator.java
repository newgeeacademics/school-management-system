package com.classroom.backend.util;

import com.classroom.backend.model.ClassItem;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

public final class ClassCodeGenerator {

    private ClassCodeGenerator() {}

    /** Compact alphanumeric code from a class name (e.g. "4ème A" → "4meA"). */
    public static String slug(String name) {
        if (name == null || name.isBlank()) {
            return "GEN";
        }
        String cleaned = name.replaceAll("[^A-Za-z0-9]", "");
        if (cleaned.length() > 6) {
            cleaned = cleaned.substring(0, 6);
        }
        return cleaned.isBlank() ? "GEN" : cleaned;
    }

    public static String ensureUniqueClassName(String requestedName, List<ClassItem> existing) {
        return ensureUniqueClassName(requestedName, existing, null);
    }

    public static String ensureUniqueClassName(
            String requestedName, List<ClassItem> existing, String excludeClassId
    ) {
        String trimmed = requestedName.trim();
        if (trimmed.isBlank()) {
            return trimmed;
        }

        Set<String> usedSlugs = new HashSet<>();
        for (ClassItem item : existing) {
            if (excludeClassId != null && excludeClassId.equals(item.getId())) {
                continue;
            }
            usedSlugs.add(slug(item.getName()).toLowerCase(Locale.ROOT));
        }

        if (isAvailable(trimmed, usedSlugs, existing, excludeClassId)) {
            return trimmed;
        }

        for (int n = 1; n <= 999; n++) {
            String candidate = trimmed + n;
            if (isAvailable(candidate, usedSlugs, existing, excludeClassId)) {
                return candidate;
            }
        }

        throw new IllegalArgumentException("Unable to assign a unique class name for: " + trimmed);
    }

    private static boolean isAvailable(
            String candidate,
            Set<String> usedSlugs,
            List<ClassItem> existing,
            String excludeClassId
    ) {
        if (usedSlugs.contains(slug(candidate).toLowerCase(Locale.ROOT))) {
            return false;
        }
        return existing.stream()
                .filter(item -> excludeClassId == null || !excludeClassId.equals(item.getId()))
                .noneMatch(item -> item.getName().equalsIgnoreCase(candidate));
    }
}
