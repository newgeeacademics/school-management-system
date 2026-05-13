package com.classroom.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class StudentGradeRequest {

    @NotBlank(message = "Evaluation ID is required")
    private String evaluationId;

    @NotBlank(message = "Student ID is required")
    private String studentId;

    @NotNull(message = "Score is required")
    @PositiveOrZero
    private Double score;
}
