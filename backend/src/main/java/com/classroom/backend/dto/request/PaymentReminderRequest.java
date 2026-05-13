package com.classroom.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PaymentReminderRequest {

    @NotBlank(message = "Parent name is required")
    private String parentName;

    private String studentName;

    @NotNull(message = "Amount is required")
    @Positive
    private Double amount;

    @NotBlank(message = "Due date is required")
    private String dueDate;
}
