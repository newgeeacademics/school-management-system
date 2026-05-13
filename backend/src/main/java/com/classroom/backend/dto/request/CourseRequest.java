package com.classroom.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourseRequest {

    private String name;

    private String matiereId;

    @NotBlank(message = "Level is required")
    private String level;
}
