package com.classroom.backend.dto.request;

import com.classroom.backend.model.enums.FeeCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FeeInstallmentRequest {

    @NotNull(message = "Category is required")
    private FeeCategory category;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    @NotBlank(message = "Label is required")
    private String label;

    @NotNull(message = "Amount is required")
    private Double amount;

    @NotBlank(message = "Period start is required")
    private String periodStart;

    @NotBlank(message = "Period end is required")
    private String periodEnd;

    private String description;

    private Integer sortOrder;
}
