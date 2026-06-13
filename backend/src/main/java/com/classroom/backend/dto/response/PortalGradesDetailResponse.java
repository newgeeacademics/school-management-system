package com.classroom.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PortalGradesDetailResponse {

    private String role;
    private boolean canEdit;
    private String classId;
    private String period;
    private String studentId;

    private List<PortalClassOption> classes;
    private List<PortalCourseOption> courses;
    private List<PortalStudentOption> students;
    private List<PortalEvaluationDto> evaluations;
    private List<PortalGradeEntryDto> grades;
    private List<GradeAverageResponse> bulletin;
    private PortalGradingConfigDto gradingConfig;

    @Data
    @Builder
    public static class PortalClassOption {
        private String id;
        private String name;
        private String level;
    }

    @Data
    @Builder
    public static class PortalCourseOption {
        private String id;
        private String name;
    }

    @Data
    @Builder
    public static class PortalStudentOption {
        private String id;
        private String name;
        private String classId;
        private String className;
    }

    @Data
    @Builder
    public static class PortalGradingConfigDto {
        private Double gradingScale;
        private List<String> evaluationTypes;
        private List<String> evaluationPeriods;
    }

    @Data
    @Builder
    public static class PortalEvaluationDto {
        private String id;
        private String classId;
        private String courseId;
        private String courseName;
        private String label;
        private String date;
        private String period;
        private String type;
        private Double coefficient;
        private Double maxScore;
        private String teacherName;
        private boolean hasDocument;
        private String documentFileName;
        private String documentContentType;
    }

    @Data
    @Builder
    public static class PortalGradeEntryDto {
        private String id;
        private String evaluationId;
        private String studentId;
        private Double score;
    }
}
