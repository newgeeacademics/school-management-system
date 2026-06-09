package com.classroom.backend.dto.request;

import com.classroom.backend.model.enums.PayrollEmployeeType;
import com.classroom.backend.model.enums.PayrollStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PayrollPaymentRequest {

    @NotNull(message = "Employee type is required")
    private PayrollEmployeeType employeeType;

    private String employeeId;

    @NotBlank(message = "Employee name is required")
    private String employeeName;

    @NotNull(message = "Amount is required")
    private Double amount;

    @NotBlank(message = "Period label is required")
    private String periodLabel;

    @NotBlank(message = "Payment date is required")
    private String paymentDate;

    private PayrollStatus status;

    private String notes;
}
