package com.classroom.backend.util;

public final class PhoneAccountUtil {

    private PhoneAccountUtil() {}

    public static String normalizePhone(String raw) {
        if (raw == null) return "";
        String digits = raw.replaceAll("[^0-9+]", "");
        if (digits.startsWith("+")) return digits;
        if (digits.startsWith("00")) return "+" + digits.substring(2);
        return digits;
    }

    /**
     * True for a phone number typed as a sign-in identifier ("07 08 09 10 11", "+225 0708091011").
     * E-mails and login ids are never phones, even with many digits ("aya20102012@gmail.com").
     */
    public static boolean looksLikePhone(String value) {
        if (value == null || value.isBlank()) return false;
        String trimmed = value.trim();
        if (!trimmed.matches("[0-9+()\\-.\\s]+")) return false;
        return normalizePhone(trimmed).length() >= 8;
    }

   
    public static String syntheticEmailForPhone(String phone) {
        String n = normalizePhone(phone).replace("+", "");
        return "phone." + n + "@portal.classroom";
    }
}
