package com.classroom.backend.repository;

import com.classroom.backend.model.RoleModuleAccess;
import com.classroom.backend.model.enums.AppModule;
import com.classroom.backend.model.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoleModuleAccessRepository extends JpaRepository<RoleModuleAccess, String> {

    Optional<RoleModuleAccess> findByRoleAndModule(UserRole role, AppModule module);

    List<RoleModuleAccess> findByRole(UserRole role);
}
