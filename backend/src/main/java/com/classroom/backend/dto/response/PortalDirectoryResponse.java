package com.classroom.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PortalDirectoryResponse {

    private List<PortalTeacherContactDto> teachers;

    @Data
    @Builder
    public static class PortalTeacherContactDto {
        private String classId;
        private String className;
        private String studentName;
        private String teacherId;
        private String teacherName;
        private String subject;
        private String phone;
        private String email;
    }
}
