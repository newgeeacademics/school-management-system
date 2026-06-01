package com.classroom.backend.portal;

public enum PortalSection {
    ALL,
    OVERVIEW,
    SCHOOLS,
    SCHEDULE,
    GRADES,
    CANTEEN,
    TRANSPORT,
    MESSAGES;

    public static PortalSection fromPath(String requestUri) {
        if (requestUri == null) {
            return ALL;
        }
        if (requestUri.startsWith("/api/schools")) {
            return SCHOOLS;
        }
        if (requestUri.startsWith("/api/schedule")) {
            return SCHEDULE;
        }
        if (requestUri.startsWith("/api/grades")) {
            return GRADES;
        }
        if (requestUri.startsWith("/api/canteen")) {
            return CANTEEN;
        }
        if (requestUri.startsWith("/api/transport")) {
            return TRANSPORT;
        }
        if (requestUri.startsWith("/api/calendar")) {
            return MESSAGES;
        }
        return ALL;
    }

    public static PortalSection fromClientValue(String value) {
        if (value == null || value.isBlank()) {
            return ALL;
        }
        try {
            return PortalSection.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return switch (value.trim().toLowerCase()) {
                case "overview" -> OVERVIEW;
                case "schools" -> SCHOOLS;
                case "schedule" -> SCHEDULE;
                case "grades" -> GRADES;
                case "canteen" -> CANTEEN;
                case "transport" -> TRANSPORT;
                case "messages", "events" -> MESSAGES;
                default -> ALL;
            };
        }
    }
}
