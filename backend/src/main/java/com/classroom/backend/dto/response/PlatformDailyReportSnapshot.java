package com.classroom.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.List;

@Data
@Builder
public class PlatformDailyReportSnapshot {
    private ZonedDateTime generatedAt;
    private boolean emailConfigured;

    private long totalSchools;
    private long schoolsRegisteredLast24h;
    private long totalStudents;
    private long totalTeachers;
    private long totalParents;
    private long totalClasses;
    private long totalCourses;
    private long totalRooms;
    private long totalTransportRoutes;
    private long totalDrivers;

    private long totalAdmins;
    private long totalPortalTeachers;
    private long totalPortalStudents;
    private long totalPortalParents;
    private long totalStaffUsers;

    private long attendanceRecordsYesterday;
    private long paymentRemindersPending;
    private long activeBusTrips;

    private List<SchoolLine> schools;

    @Data
    @Builder
    public static class SchoolLine {
        private String name;
        private String city;
        private String country;
        private String createdAt;
    }
}
