package com.classroom.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class GradeAverageResponse {
    private String studentId;
    private String studentName;
    private Double average;
    private Integer rank;
}
