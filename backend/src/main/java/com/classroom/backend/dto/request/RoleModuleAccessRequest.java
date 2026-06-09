package com.classroom.backend.dto.request;

import com.classroom.backend.model.enums.AccessLevel;
import com.classroom.backend.model.enums.AppModule;
import com.classroom.backend.model.enums.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleModuleAccessRequest {

    @NotNull
    private UserRole role;

    @NotNull
    private AppModule module;

    @NotNull
    private AccessLevel accessLevel;
}
