package com.classroom.backend.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class StudentRequest {

  private String name;

  private String firstName;

  private String lastName;

  private String classId;

  /** Optional card number; generated from matricule when omitted. */
  private String idCardNumber;

  @Email(message = "Invalid email format")
  private String email;

  private String password;

  private String phone;
}
