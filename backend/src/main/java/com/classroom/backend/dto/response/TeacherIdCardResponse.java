package com.classroom.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeacherIdCardResponse {
  private String teacherId;
  private String staffId;
  private String firstName;
  private String lastName;
  private String teacherName;
  private String subject;
  private String schoolName;
  private String schoolCity;
  private String academicYear;
  private String qrPayload;
}
