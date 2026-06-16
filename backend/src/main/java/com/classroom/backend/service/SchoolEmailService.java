package com.classroom.backend.service;

import com.classroom.backend.model.School;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.AppUserRepository;
import com.classroom.backend.repository.SchoolRepository;
import com.classroom.backend.util.SchoolLoginEmailUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SchoolEmailService {

    private final SchoolRepository schoolRepository;
    private final AppUserRepository appUserRepository;

    public String previewLoginEmail(String firstName, String lastName, UserRole role) {
        return SchoolLoginEmailUtil.buildLoginEmail(
                firstName,
                lastName,
                role,
                resolveSchoolSlug(),
                resolveBaseDomain(),
                1);
    }

    public String generateUniqueLoginEmail(String firstName, String lastName, UserRole role) {
        String schoolSlug = resolveSchoolSlug();
        String baseDomain = resolveBaseDomain();

        for (int seq = 1; seq <= 999; seq++) {
            String candidate = SchoolLoginEmailUtil.buildLoginEmail(
                    firstName, lastName, role, schoolSlug, baseDomain, seq);
            if (!appUserRepository.existsByEmail(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Impossible de générer un identifiant de connexion unique.");
    }

    private School resolveSchool() {
        return schoolRepository.findAll().stream()
                .reduce((first, second) -> second)
                .orElse(null);
    }

    private String resolveSchoolSlug() {
        School school = resolveSchool();
        if (school == null || school.getName() == null || school.getName().isBlank()) {
            return "ecole";
        }
        String slug = SchoolLoginEmailUtil.slugifySchoolName(school.getName());
        return slug.isEmpty() ? "ecole" : slug;
    }

    private String resolveBaseDomain() {
        School school = resolveSchool();
        if (school == null) {
            return "classroom.local";
        }
        String fromWebsite = SchoolLoginEmailUtil.extractBaseDomain(school.getWebsite());
        if (!fromWebsite.isEmpty()) {
            return fromWebsite;
        }
        String fromOfficial = SchoolLoginEmailUtil.extractBaseDomain(school.getOfficialEmail());
        if (!fromOfficial.isEmpty() && fromOfficial.contains(".")) {
            int at = fromOfficial.indexOf('@');
            return at >= 0 ? fromOfficial.substring(at + 1) : fromOfficial;
        }
        return "classroom.local";
    }
}
