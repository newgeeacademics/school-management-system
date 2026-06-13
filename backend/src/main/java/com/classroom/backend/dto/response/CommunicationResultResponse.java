package com.classroom.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommunicationResultResponse {

    private int recipientsCount;
    private int emailsSent;
    private boolean emailConfigured;
    private boolean portalPublished;
    private String message;
}
