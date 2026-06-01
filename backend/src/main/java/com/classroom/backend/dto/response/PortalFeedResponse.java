package com.classroom.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PortalFeedResponse {

    private String role;
    private String profileName;

    private List<PortalClassDto> classes;
    private List<PortalStudentDto> students;
    private List<PortalScheduleDto> schedule;
    private List<PortalGradeDto> grades;
    private List<PortalCanteenDto> canteen;
    private List<PortalTransportDto> transport;
    private List<PortalEventDto> events;
    private List<PortalSchoolDto> schools;

    @Data
    @Builder
    public static class PortalClassDto {
        private String id;
        private String name;
        private String level;
        private Integer studentsCount;
    }

    @Data
    @Builder
    public static class PortalStudentDto {
        private String id;
        private String name;
        private String classId;
        private String className;
    }

    @Data
    @Builder
    public static class PortalScheduleDto {
        private String id;
        private String day;
        private String time;
        private String room;
        private String className;
        private String courseName;
    }

    @Data
    @Builder
    public static class PortalGradeDto {
        private String id;
        private Double score;
        private String studentName;
        private String evaluationLabel;
    }

    @Data
    @Builder
    public static class PortalCanteenDto {
        private String id;
        private String day;
        private String mealType;
        private String dish;
        private String note;
    }

    @Data
    @Builder
    public static class PortalTransportDto {
        private String id;
        private String name;
        private String driverName;
        private String departureTime;
        private String returnTime;
    }

    @Data
    @Builder
    public static class PortalEventDto {
        private String id;
        private String label;
        private String date;
        private String time;
        private String location;
    }

    @Data
    @Builder
    public static class PortalSchoolDto {
        private String id;
        private String name;
        private String city;
        private String country;
        private String officialEmail;
    }
}
