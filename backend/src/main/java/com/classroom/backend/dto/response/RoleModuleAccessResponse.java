package com.classroom.backend.dto.response;

import com.classroom.backend.model.enums.AccessLevel;
import com.classroom.backend.model.enums.AppModule;
import com.classroom.backend.model.enums.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoleModuleAccessResponse {
    private UserRole role;
    private AppModule module;
    private AccessLevel accessLevel;
}
