package com.classroom.backend.dto.request;

import com.classroom.backend.model.enums.EvaluationPeriod;
import com.classroom.backend.model.enums.EvaluationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class EvaluationRequest {

    @NotBlank(message = "Class ID is required")
    private String classId;

    @NotBlank(message = "Course ID is required")
    private String courseId;

    @NotBlank(message = "Label is required")
    private String label;

    @NotBlank(message = "Date is required")
    private String date;

    @NotNull(message = "Period is required")
    private EvaluationPeriod period;

    @NotNull(message = "Type is required")
    private EvaluationType type;

    @NotNull(message = "Coefficient is required")
    @Positive
    private Double coefficient;

    @NotNull(message = "Max score is required")
    @Positive
    private Double maxScore;
}
