package com.classroom.backend.service;

import com.classroom.backend.dto.request.RoleModuleAccessRequest;
import com.classroom.backend.dto.response.MyRoleAccessResponse;
import com.classroom.backend.dto.response.RoleModuleAccessResponse;
import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.RoleModuleAccess;
import com.classroom.backend.model.enums.AccessLevel;
import com.classroom.backend.model.enums.AppModule;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.AppUserRepository;
import com.classroom.backend.repository.RoleModuleAccessRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleAccessService {

    private final RoleModuleAccessRepository repository;
    private final AppUserRepository appUserRepository;
    private final AccountIdentifierService accountIdentifierService;

    @Transactional
    public void ensureDefaults() {
        if (repository.count() > 0) {
            return;
        }
        seedDefault(UserRole.ADMIN, AccessLevel.WRITE, AccessLevel.READ, AccessLevel.WRITE);
        seedDefault(UserRole.TEACHER, AccessLevel.NONE, AccessLevel.WRITE, AccessLevel.READ);
        seedDefault(UserRole.STAFF, AccessLevel.READ, AccessLevel.NONE, AccessLevel.WRITE);
        seedDefault(UserRole.PARENT, AccessLevel.NONE, AccessLevel.WRITE, AccessLevel.NONE);
        seedDefault(UserRole.STUDENT, AccessLevel.NONE, AccessLevel.WRITE, AccessLevel.NONE);
    }

    private void seedDefault(
            UserRole role,
            AccessLevel adminConsole,
            AccessLevel familyPortal,
            AccessLevel financeOffice
    ) {
        save(role, AppModule.ADMIN_CONSOLE, adminConsole);
        save(role, AppModule.FAMILY_PORTAL, familyPortal);
        save(role, AppModule.FINANCE_OFFICE, financeOffice);
    }

    public List<RoleModuleAccessResponse> findAll() {
        ensureDefaults();
        return repository.findAll().stream()
                .map(this::toResponse)
                .sorted(Comparator.comparing((RoleModuleAccessResponse r) -> r.getRole().name())
                        .thenComparing(r -> r.getModule().name()))
                .toList();
    }

    public MyRoleAccessResponse myAccess() {
        AppUser user = currentUser();
        ensureDefaults();
        Map<AppModule, AccessLevel> modules = new EnumMap<>(AppModule.class);
        for (AppModule module : AppModule.values()) {
            modules.put(module, resolveLevel(user.getRole(), module));
        }
        return MyRoleAccessResponse.builder()
                .role(user.getRole())
                .modules(modules)
                .build();
    }

    public AccessLevel resolveLevel(UserRole role, AppModule module) {
        ensureDefaults();
        return repository.findByRoleAndModule(role, module)
                .map(RoleModuleAccess::getAccessLevel)
                .orElse(AccessLevel.NONE);
    }

    public boolean hasAtLeast(UserRole role, AppModule module, AccessLevel minimum) {
        return rank(resolveLevel(role, module)) >= rank(minimum);
    }

    @Transactional
    public List<RoleModuleAccessResponse> updateAll(List<RoleModuleAccessRequest> requests) {
        ensureDefaults();
        for (RoleModuleAccessRequest request : requests) {
            save(request.getRole(), request.getModule(), request.getAccessLevel());
        }
        return findAll();
    }

    private void save(UserRole role, AppModule module, AccessLevel level) {
        RoleModuleAccess row = repository.findByRoleAndModule(role, module)
                .orElse(RoleModuleAccess.builder().role(role).module(module).build());
        row.setAccessLevel(level);
        repository.save(row);
    }

    private RoleModuleAccessResponse toResponse(RoleModuleAccess row) {
        return RoleModuleAccessResponse.builder()
                .role(row.getRole())
                .module(row.getModule())
                .accessLevel(row.getAccessLevel())
                .build();
    }

    private AppUser currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new IllegalStateException("Not authenticated");
        }
        return accountIdentifierService.findByPrincipalName(auth.getName())
                .or(() -> accountIdentifierService.findBySignInIdentifier(auth.getName()))
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    private static int rank(AccessLevel level) {
        return switch (level) {
            case NONE -> 0;
            case READ -> 1;
            case WRITE -> 2;
        };
    }
}
