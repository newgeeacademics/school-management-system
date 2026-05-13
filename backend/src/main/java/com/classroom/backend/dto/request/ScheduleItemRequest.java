package com.classroom.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ScheduleItemRequest {

    @NotBlank(message = "Class ID is required")
    private String classId;

    private String courseId;

    @NotBlank(message = "Day is required")
    private String day;

    @NotBlank(message = "Time is required")
    private String time;

    private String room;
}
