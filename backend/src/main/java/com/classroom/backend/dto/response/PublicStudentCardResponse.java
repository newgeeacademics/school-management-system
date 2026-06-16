package com.classroom.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PublicStudentCardResponse {
    private String studentId;
    private String matricule;
    private String idCardNumber;
    private String firstName;
    private String lastName;
    private String studentName;
    private String className;
    private String classLevel;
    private String schoolName;
    private String schoolCity;
    private String schoolAddress;
    private String schoolPhone;
    private String schoolEmail;
    private String headName;
    private String academicYear;
    private String homeroomTeacherName;
    private String parentName;
    private String parentPhone;
}
