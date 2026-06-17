package com.classroom.backend.service;

import com.classroom.backend.model.School;
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

    public String previewLoginId(String firstName, String lastName) {
        return SchoolLoginEmailUtil.buildLocalPart(firstName, lastName, 1);
    }

    public String generateUniqueLoginId(String firstName, String lastName) {
        for (int seq = 1; seq <= 999; seq++) {
            String candidate = SchoolLoginEmailUtil.buildLocalPart(firstName, lastName, seq);
            if (!appUserRepository.existsByLoginIdIgnoreCase(candidate)) {
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
}
