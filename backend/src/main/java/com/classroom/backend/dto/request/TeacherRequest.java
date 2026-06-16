package com.classroom.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class TeacherRequest {

  private String name;

  private String firstName;

  private String lastName;

  @NotBlank(message = "Subject is required")
  private String subject;

  /** Optional staff badge number; auto-generated when omitted. */
  private String staffId;

  @Email(message = "Invalid email format")
  private String email;

  private String password;

  private String phone;

  private List<String> homeroomClassIds;
}
