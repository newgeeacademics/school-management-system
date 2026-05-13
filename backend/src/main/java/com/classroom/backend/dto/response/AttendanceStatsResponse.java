package com.classroom.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class AttendanceStatsResponse {
    private String studentId;
    private String studentName;
    private Long totalRecords;
    private Long presentCount;
    private Long absentCount;
    private Long lateCount;
    private Double attendanceRate;
}
