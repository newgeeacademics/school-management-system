package com.classroom.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class PortalNotificationsResponse {

    private List<PortalNotificationDto> notifications;

    @Data
    @AllArgsConstructor
    @Builder
    public static class PortalNotificationDto {
        private String id;
        private String type;
        private String title;
        private String body;
        private String date;
        private String studentName;
    }
}
