package com.classroom.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PortalMessagesResponse {

    private List<PortalMessageDto> messages;

    @Data
    @Builder
    public static class PortalMessageDto {
        private String id;
        private String subject;
        private String body;
        private String senderName;
        private String sentAt;
        private String className;
    }
}
