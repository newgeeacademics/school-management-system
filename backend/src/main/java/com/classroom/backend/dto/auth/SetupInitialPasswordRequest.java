package com.classroom.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SetupInitialPasswordRequest {

    @NotBlank
    private String setupToken;

    @NotBlank
    @Size(min = 6, max = 128)
    private String newPassword;
}
