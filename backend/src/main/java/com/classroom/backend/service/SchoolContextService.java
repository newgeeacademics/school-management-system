package com.classroom.backend.service;

import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.enums.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;

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

    /** Required for dashboard mutations and listings scoped to one establishment. */
    public String requireCurrentSchoolId() {
        return getCurrentSchoolId().orElseThrow(() -> new IllegalStateException(
                "Aucun établissement associé à ce compte. Connectez-vous avec le compte administrateur de l'école."));
    }

    public <T> List<T> findAllForCurrentSchool(Function<String, List<T>> bySchoolId) {
        return bySchoolId.apply(requireCurrentSchoolId());
    }

    public void assertSchoolAccess(String entitySchoolId) {
        getCurrentSchoolId().ifPresent(schoolId -> {
            if (entitySchoolId == null || !entitySchoolId.equals(schoolId)) {
                throw new RuntimeException("Access denied for this school");
            }
        });
    }

    /** Ensures two records belong to the same establishment (and to the logged-in admin's school). */
    public void assertSameSchool(String leftSchoolId, String rightSchoolId, String message) {
        if (leftSchoolId == null || leftSchoolId.isBlank()
                || rightSchoolId == null || rightSchoolId.isBlank()
                || !leftSchoolId.equals(rightSchoolId)) {
            throw new IllegalStateException(message);
        }
        assertSchoolAccess(leftSchoolId);
    }
}
