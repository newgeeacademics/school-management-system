package com.classroom.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    /** Email or phone number. */
    @NotBlank(message = "Email or phone is required")
    private String email;

    /** Optional when the account still requires an initial password setup. */
    private String password;
}
