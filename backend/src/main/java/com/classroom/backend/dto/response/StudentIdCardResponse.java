package com.classroom.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentIdCardResponse {
    private String studentId;
    private String matricule;
    private String studentName;
    private String className;
    private String schoolName;
    private String qrPayload;
}
