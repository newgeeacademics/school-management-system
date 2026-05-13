package com.classroom.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClassItemRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Level is required")
    private String level;

    @NotNull(message = "Students count is required")
    private Integer studentsCount;

    private String homeroomTeacherId;
}
