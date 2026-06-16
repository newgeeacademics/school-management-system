package com.classroom.backend.util;

public final class IdCardNumberUtil {

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
        String suffix = teacherId != null && teacherId.length() >= 8
                ? teacherId.substring(0, 8).toUpperCase()
                : "00000000";
        return "ENS-" + suffix;
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
