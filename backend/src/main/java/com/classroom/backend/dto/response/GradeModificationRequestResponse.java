package com.classroom.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeModificationRequestResponse {

    private String id;
    private String evaluationId;
    private String evaluationLabel;
    private String courseName;
    private String studentId;
    private String studentName;
    private String classId;
    private String className;
    private String teacherId;
    private String teacherName;
    private Double currentScore;
    private Double requestedScore;
    private Double maxScore;
    private String reason;
    private String status;
    private String adminNote;
    private String reviewedByName;
    private String createdAt;
    private String reviewedAt;
}
