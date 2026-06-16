package com.classroom.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PortalChatResponse {

    private List<PortalChatMessageDto> messages;

    @Data
    @Builder
    public static class PortalChatMessageDto {
        private String id;
        private String senderUserId;
        private String senderName;
        private String senderRole;
        private String body;
        private String sentAt;
    }
}
