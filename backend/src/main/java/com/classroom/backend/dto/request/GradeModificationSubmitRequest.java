package com.classroom.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GradeModificationSubmitRequest {

    @NotBlank(message = "Evaluation id is required")
    private String evaluationId;

    @NotBlank(message = "Student id is required")
    private String studentId;

    @NotNull(message = "Requested score is required")
    private Double requestedScore;

    @NotBlank(message = "Reason is required")
    private String reason;
}
