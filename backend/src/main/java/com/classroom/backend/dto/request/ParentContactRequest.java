package com.classroom.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ParentContactRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String phone;
    private String email;
    private String studentId;
}
