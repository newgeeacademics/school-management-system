package com.classroom.backend.service;

import com.classroom.backend.model.School;
import com.classroom.backend.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SchoolLookupService {

    private final SchoolRepository schoolRepository;
    private final SchoolContextService schoolContextService;

    public String currentSchoolName() {
        return schoolContextService.getCurrentSchoolId()
                .flatMap(schoolRepository::findById)
                .map(School::getName)
                .filter(name -> name != null && !name.isBlank())
                .orElse("Établissement scolaire");
    }
}
