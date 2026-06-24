package com.classroom.backend.service;

import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.enums.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SchoolContextService {

    private final AccountIdentifierService accountIdentifierService;

    /** School id of the logged-in establishment admin, if any. */
    public Optional<String> getCurrentSchoolId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            return Optional.empty();
        }
        try {
            AppUser user = accountIdentifierService.requireByPrincipalName(auth.getName());
            if (user.getRole() == UserRole.ADMIN
                    && user.getSchoolId() != null
                    && !user.getSchoolId().isBlank()) {
                return Optional.of(user.getSchoolId());
            }
        } catch (Exception ignored) {
            // Unauthenticated or unknown principal — no school scope.
        }
        return Optional.empty();
    }

    public void assertSchoolAccess(String entitySchoolId) {
        getCurrentSchoolId().ifPresent(schoolId -> {
            if (entitySchoolId == null || !entitySchoolId.equals(schoolId)) {
                throw new RuntimeException("Access denied for this school");
            }
        });
    }
}
