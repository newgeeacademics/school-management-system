package com.classroom.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PortalClassDetailResponse {

    private String id;
    private String name;
    private String level;
    private Integer studentsCount;
    private boolean canEdit;
    private List<PortalStudentRow> students;

    @Data
    @Builder
    public static class PortalStudentRow {
        private String id;
        private String name;
    }
}
