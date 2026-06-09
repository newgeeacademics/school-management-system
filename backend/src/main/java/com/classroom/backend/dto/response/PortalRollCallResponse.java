package com.classroom.backend.dto.response;

import com.classroom.backend.model.enums.AttendanceStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PortalRollCallResponse {

    private String classId;
    private String className;
    private String date;
    private boolean canEdit;
    private List<PortalRollCallRow> students;

    @Data
    @Builder
    public static class PortalRollCallRow {
        private String studentId;
        private String studentName;
        private AttendanceStatus status;
        private String recordId;
    }
}
