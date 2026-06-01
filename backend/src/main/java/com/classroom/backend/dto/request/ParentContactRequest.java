package com.classroom.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ParentContactRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    private String studentId;

    /** Portal password; defaults to changeme when email is set. */
    private String password;
}
