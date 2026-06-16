package com.classroom.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PortalChatSendRequest {

    @NotBlank
    @Size(max = 2000)
    private String body;
}
