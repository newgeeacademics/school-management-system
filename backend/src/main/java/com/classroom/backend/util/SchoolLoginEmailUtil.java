package com.classroom.backend.util;

import com.classroom.backend.model.enums.UserRole;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public final class SchoolLoginEmailUtil {

    private static final Pattern NON_ALNUM = Pattern.compile("[^a-z0-9]");

    private SchoolLoginEmailUtil() {
    }

    public static String roleSubdomain(UserRole role) {
        return switch (role) {
            case STUDENT -> "eleve";
            case TEACHER -> "enseignant";
            case PARENT -> "parent";
            case STAFF -> "personnel";
            default -> "utilisateur";
        };
    }

  
    public static String buildLocalPart(String firstName, String lastName, int sequence) {
        String first = slugifyName(firstName);
        if (first.isEmpty()) {
            first = "user";
        }
        String lastSlug = slugifyName(lastName);
        char lastInitial = lastSlug.isEmpty() ? 'x' : lastSlug.charAt(0);
        int seq = Math.max(1, sequence);
        return first + lastInitial + seq;
    }

    public static String buildLoginEmail(
            String firstName,
            String lastName,
            UserRole role,
            String schoolSlug,
            String baseDomain,
            int sequence
    ) {
        String local = buildLocalPart(firstName, lastName, sequence);
        String rolePart = roleSubdomain(role);
        String slug = slugifyName(schoolSlug);
        if (slug.isEmpty()) {
            slug = "ecole";
        }
        String domain = normalizeDomain(baseDomain);
        if (domain.isEmpty()) {
            domain = "classroom.local";
        }
        return local + "@" + rolePart + "." + slug + "." + domain;
    }

    public static String slugifySchoolName(String schoolName) {
        return slugifyName(schoolName);
    }

    public static String extractBaseDomain(String website) {
        return normalizeDomain(website);
    }

    private static String normalizeDomain(String raw) {
        if (raw == null || raw.isBlank()) {
            return "";
        }
        String value = raw.trim().toLowerCase(Locale.ROOT);
        value = value.replaceFirst("^https?://", "");
        value = value.replaceFirst("^www\\.", "");
        int slash = value.indexOf('/');
        if (slash >= 0) {
            value = value.substring(0, slash);
        }
        return value.replaceAll("\\s+", "");
    }

    private static String slugifyName(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String normalized = Normalizer.normalize(input.trim(), Normalizer.Form.NFD);
        String ascii = normalized.replaceAll("\\p{M}", "");
        ascii = ascii.toLowerCase(Locale.ROOT);
        return NON_ALNUM.matcher(ascii).replaceAll("");
    }
}
