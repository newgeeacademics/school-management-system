package com.classroom.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TeacherRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Subject is required")
    private String subject;

    @Email(message = "Invalid email format")
    private String email;

    /** Portal password; defaults to changeme when email is set. */
    private String password;

    private String phone;
}
