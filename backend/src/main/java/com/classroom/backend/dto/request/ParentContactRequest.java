package com.classroom.backend.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class ParentContactRequest {

  private String name;

  private String firstName;

  private String lastName;

  private String phone;

  @Email(message = "Invalid email format")
  private String email;

  private String studentId;

  private String password;
}
