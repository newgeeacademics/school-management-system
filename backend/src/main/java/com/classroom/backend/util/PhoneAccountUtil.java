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

    public static boolean looksLikePhone(String value) {
        if (value == null || value.isBlank()) return false;
        String n = normalizePhone(value);
        return n.length() >= 8 && !n.contains("@");
    }

   
    public static String syntheticEmailForPhone(String phone) {
        String n = normalizePhone(phone).replace("+", "");
        return "phone." + n + "@portal.classroom";
    }
}
