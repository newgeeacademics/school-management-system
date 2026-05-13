package com.classroom.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MatiereRequest {

    @NotBlank(message = "Name is required")
    private String name;
}
