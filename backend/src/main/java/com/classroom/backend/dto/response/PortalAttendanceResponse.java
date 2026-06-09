package com.classroom.backend.dto.response;

import com.classroom.backend.model.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class PortalAttendanceResponse {

    private String studentId;
    private String studentName;
    private List<PortalStudentOption> students;
    private AttendanceStatsResponse stats;
    private List<PortalAttendanceRecordDto> records;

    @Data
    @AllArgsConstructor
    @Builder
    public static class PortalStudentOption {
        private String id;
        private String name;
        private String className;
    }

    @Data
    @AllArgsConstructor
    @Builder
    public static class PortalAttendanceRecordDto {
        private String id;
        private String date;
        private AttendanceStatus status;
        private String className;
        private String studentName;
    }
}
