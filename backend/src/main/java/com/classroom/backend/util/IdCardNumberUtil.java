package com.classroom.backend.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class IdCardNumberUtil {

    private static final Pattern TEACHER_STAFF_PATTERN =
            Pattern.compile("^ENS-(\\d+)$", Pattern.CASE_INSENSITIVE);

    private IdCardNumberUtil() {
    }
    public static String resolveStudentCardNumber(String requested, String matricule, String studentId) {
        if (requested != null && !requested.isBlank()) {
            return requested.trim();
        }
        if (matricule != null && !matricule.isBlank()) {
            return matricule;
        }
        String suffix = studentId != null && studentId.length() >= 8
                ? studentId.substring(0, 8).toUpperCase()
                : "00000000";
        return "CARTE-" + suffix;
    }

    public static String resolveTeacherStaffId(String requested, String teacherId) {
        if (requested != null && !requested.isBlank()) {
            return requested.trim();
        }
        if (teacherId != null && teacherId.length() >= 8) {
            return "ENS-" + teacherId.substring(0, 8).toUpperCase();
        }
        return formatTeacherStaffId(1);
    }

    /** Sequential badge number: ENS-00000001, ENS-00000002, … */
    public static String formatTeacherStaffId(int sequence) {
        int value = Math.max(sequence, 1);
        return "ENS-" + String.format("%08d", value);
    }

    /** Returns 0 when the value is not a sequential ENS-######## code. */
    public static int parseTeacherStaffSequence(String staffId) {
        if (staffId == null || staffId.isBlank()) {
            return 0;
        }
        Matcher matcher = TEACHER_STAFF_PATTERN.matcher(staffId.trim());
        if (!matcher.matches()) {
            return 0;
        }
        try {
            return Integer.parseInt(matcher.group(1));
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    public static String resolveDriverStaffId(String requested, String driverId) {
        if (requested != null && !requested.isBlank()) {
            return requested.trim();
        }
        String suffix = driverId != null && driverId.length() >= 8
                ? driverId.substring(0, 8).toUpperCase()
                : "00000000";
        return "DRV-" + suffix;
    }
}
