package com.classroom.backend.service.email.templates;

public final class EmailTemplateUtil {

    private EmailTemplateUtil() {}

    /** Inbox preview line (keep under ~120 chars). */
    public static String preheader(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }
        String oneLine = text.replace('\n', ' ').replaceAll("\\s+", " ").trim();
        if (oneLine.length() <= 120) {
            return oneLine;
        }
        return oneLine.substring(0, 117) + "...";
    }
}
