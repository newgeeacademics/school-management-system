package com.classroom.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    /** Email or phone number. */
    @NotBlank(message = "Email or phone is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
