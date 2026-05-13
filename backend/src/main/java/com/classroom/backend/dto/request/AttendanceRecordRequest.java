package com.classroom.backend.dto.request;

import com.classroom.backend.model.enums.AttendanceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AttendanceRecordRequest {

    @NotBlank(message = "Date is required")
    private String date;

    private String classId;

    @NotBlank(message = "Student ID is required")
    private String studentId;

    @NotNull(message = "Status is required")
    private AttendanceStatus status;
}
