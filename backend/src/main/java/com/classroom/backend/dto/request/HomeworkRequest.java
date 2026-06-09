package com.classroom.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HomeworkRequest {

    @NotBlank(message = "Class ID is required")
    private String classId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Due date is required")
    private String dueDate;
}
