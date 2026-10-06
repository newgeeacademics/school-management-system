package com.classroom.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {

    /** ID token (JWT) returned by Google Identity Services in the browser. */
    @NotBlank(message = "idToken is required")
    private String idToken;
}
