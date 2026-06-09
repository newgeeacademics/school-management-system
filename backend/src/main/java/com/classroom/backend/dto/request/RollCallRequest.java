package com.classroom.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class RollCallRequest {

    @NotBlank(message = "Class ID is required")
    private String classId;

    @NotBlank(message = "Date is required")
    private String date;

    @NotEmpty(message = "At least one attendance entry is required")
    @Valid
    private List<RollCallEntryRequest> entries;
}
