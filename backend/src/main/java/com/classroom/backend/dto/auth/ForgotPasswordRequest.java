package com.classroom.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {

    /** Login id, e-mail, or phone number. */
    @NotBlank
    private String email;
}
