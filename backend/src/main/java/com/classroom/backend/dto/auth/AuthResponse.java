package com.classroom.backend.dto.auth;

import com.classroom.backend.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String id;
    private String name;
    private String email;
    private UserRole role;
    /** Short portal login id when different from contact email. */
    private String loginId;
    /** Set when registering a school in one step. */
    private String schoolId;
}
