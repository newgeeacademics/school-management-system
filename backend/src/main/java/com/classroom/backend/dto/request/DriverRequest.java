package com.classroom.backend.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class DriverRequest {

    private String name;

    private String firstName;

    private String lastName;

    private String staffId;

    private String licenseNumber;

    @Email(message = "Invalid email format")
    private String email;

    private String password;

    private String phone;
}
