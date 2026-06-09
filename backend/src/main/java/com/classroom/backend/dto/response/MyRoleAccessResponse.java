package com.classroom.backend.dto.response;

import com.classroom.backend.model.enums.AccessLevel;
import com.classroom.backend.model.enums.AppModule;
import com.classroom.backend.model.enums.UserRole;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class MyRoleAccessResponse {
    private UserRole role;
    private Map<AppModule, AccessLevel> modules;
}
