package com.classroom.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PortalHomeworkResponse {

    private String classId;
    private String className;
    private boolean canEdit;
    private List<PortalHomeworkDto> items;

    @Data
    @Builder
    public static class PortalHomeworkDto {
        private String id;
        private String title;
        private String description;
        private String dueDate;
        private String createdAt;
    }
}
