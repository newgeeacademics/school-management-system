package com.classroom.backend.service;

import com.classroom.backend.model.Teacher;
import com.classroom.backend.repository.TeacherRepository;
import com.classroom.backend.util.IdCardNumberUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeacherStaffIdService {

    private final TeacherRepository teacherRepository;

    public String allocateNextStaffId() {
        int maxSequence = teacherRepository.findAll().stream()
                .map(Teacher::getStaffId)
                .mapToInt(IdCardNumberUtil::parseTeacherStaffSequence)
                .max()
                .orElse(0);

        int candidate = maxSequence + 1;
        String staffId;
        do {
            staffId = IdCardNumberUtil.formatTeacherStaffId(candidate);
            candidate++;
        } while (teacherRepository.existsByStaffId(staffId));

        return staffId;
    }

    public void assertStaffIdAvailable(String staffId, String excludeTeacherId) {
        if (staffId == null || staffId.isBlank()) {
            return;
        }
        teacherRepository.findByStaffId(staffId.trim()).ifPresent(existing -> {
            if (excludeTeacherId == null || !existing.getId().equals(excludeTeacherId)) {
                throw new IllegalArgumentException("Ce code enseignant existe déjà : " + staffId.trim());
            }
        });
    }
}
