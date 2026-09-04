package com.classroom.backend.service;

import com.classroom.backend.model.School;
import com.classroom.backend.repository.ClassItemRepository;
import com.classroom.backend.repository.SchoolRepository;
import com.classroom.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SchoolCapacityService {

    private final SchoolRepository schoolRepository;
    private final ClassItemRepository classItemRepository;
    private final StudentRepository studentRepository;

    public Integer getLicensedCapacity(String schoolId) {
        return schoolRepository.findById(schoolId)
                .map(School::getStudentCount)
                .filter(count -> count != null && count > 0)
                .orElse(null);
    }

    public int sumPlannedEnrollment(String schoolId) {
        return classItemRepository.findBySchoolId(schoolId).stream()
                .mapToInt(c -> c.getStudentsCount() != null ? c.getStudentsCount() : 0)
                .sum();
    }

    public long countEnrolledStudents(String schoolId) {
        return studentRepository.findBySchoolId(schoolId).size();
    }

    public void assertPlannedEnrollmentWithinCapacity(
            String schoolId,
            String excludeClassId,
            int newCountForClass
    ) {
        Integer licensed = getLicensedCapacity(schoolId);
        if (licensed == null) {
            return;
        }

        int currentSum = classItemRepository.findBySchoolId(schoolId).stream()
                .filter(c -> excludeClassId == null || !excludeClassId.equals(c.getId()))
                .mapToInt(c -> c.getStudentsCount() != null ? c.getStudentsCount() : 0)
                .sum();

        int safeCount = Math.max(0, newCountForClass);
        int projected = currentSum + safeCount;
        if (projected > licensed) {
            int over = projected - licensed;
            throw new IllegalArgumentException(String.format(
                    "Effectif planifié dépassé : %d élèves prévus pour %d places souscrites (+%d). "
                            + "Augmentez votre abonnement dans Facturation.",
                    projected, licensed, over));
        }
    }

    public void assertCanEnrollStudent(String schoolId) {
        Integer licensed = getLicensedCapacity(schoolId);
        if (licensed == null) {
            return;
        }

        long enrolled = countEnrolledStudents(schoolId);
        if (enrolled + 1 > licensed) {
            throw new IllegalArgumentException(String.format(
                    "Limite d'élèves atteinte (%d / %d). "
                            + "Augmentez votre abonnement dans Facturation pour inscrire d'autres élèves.",
                    enrolled, licensed));
        }
    }
}
