package com.classroom.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class OverviewResponse {
    private Long totalStudents;
    private Long totalTeachers;
    private Long totalClasses;
    private Long totalCourses;
    private Long totalRooms;
    private Long totalParents;
    private Long upcomingEvents;
}
