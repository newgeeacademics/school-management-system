package com.classroom.backend.service;

import com.classroom.backend.dto.response.PublicTeacherCardResponse;
import com.classroom.backend.dto.response.TeacherIdCardResponse;
import com.classroom.backend.model.School;
import com.classroom.backend.model.Teacher;
import com.classroom.backend.repository.SchoolRepository;
import com.classroom.backend.repository.TeacherRepository;
import com.classroom.backend.util.AcademicYearUtil;
import com.classroom.backend.util.PersonNameUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TeacherIdCardService {

    private final TeacherRepository teacherRepository;
    private final SchoolRepository schoolRepository;
    private final PublicAppUrlService publicAppUrlService;
    private final TeacherStaffIdService teacherStaffIdService;

    @Transactional
    public TeacherIdCardResponse getIdCard(String teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherId));

        if (teacher.getStaffId() == null || teacher.getStaffId().isBlank()) {
            teacher.setStaffId(teacherStaffIdService.allocateNextStaffId());
            teacher = teacherRepository.save(teacher);
        }

        School school = schoolRepository.findAll().stream().findFirst().orElse(null);
        String schoolName = school != null ? school.getName() : "Établissement scolaire";
        String schoolCity = school != null ? PersonNameUtil.trim(school.getCity()) : "";

        String firstName = PersonNameUtil.trim(teacher.getFirstName());
        String lastName = PersonNameUtil.trim(teacher.getLastName());
        if (firstName.isEmpty() && lastName.isEmpty() && teacher.getName() != null) {
            String[] parts = teacher.getName().trim().split("\\s+", 2);
            firstName = parts.length > 0 ? parts[0] : teacher.getName();
            lastName = parts.length > 1 ? parts[1] : "";
        }

        String qrPayload = publicAppUrlService.teacherCardScanUrl(teacher.getId());

        return TeacherIdCardResponse.builder()
                .teacherId(teacher.getId())
                .staffId(teacher.getStaffId())
                .firstName(firstName)
                .lastName(lastName)
                .teacherName(teacher.getName())
                .subject(teacher.getSubject())
                .schoolName(schoolName)
                .schoolCity(schoolCity.isEmpty() ? null : schoolCity)
                .academicYear(AcademicYearUtil.currentLabel())
                .qrPayload(qrPayload)
                .build();
    }

    @Transactional(readOnly = true)
    public PublicTeacherCardResponse getPublicTeacherCard(String teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherId));

        School school = schoolRepository.findAll().stream().findFirst().orElse(null);

        String firstName = PersonNameUtil.trim(teacher.getFirstName());
        String lastName = PersonNameUtil.trim(teacher.getLastName());
        if (firstName.isEmpty() && lastName.isEmpty() && teacher.getName() != null) {
            String[] parts = teacher.getName().trim().split("\\s+", 2);
            firstName = parts.length > 0 ? parts[0] : teacher.getName();
            lastName = parts.length > 1 ? parts[1] : "";
        }

        return PublicTeacherCardResponse.builder()
                .teacherId(teacher.getId())
                .staffId(teacher.getStaffId())
                .firstName(firstName)
                .lastName(lastName)
                .teacherName(teacher.getName())
                .subject(teacher.getSubject())
                .schoolName(school != null ? school.getName() : "Établissement scolaire")
                .schoolCity(school != null ? emptyToNull(PersonNameUtil.trim(school.getCity())) : null)
                .schoolAddress(school != null ? emptyToNull(PersonNameUtil.trim(school.getAddress())) : null)
                .schoolPhone(school != null ? emptyToNull(PersonNameUtil.trim(school.getMainPhone())) : null)
                .schoolEmail(school != null ? emptyToNull(PersonNameUtil.trim(school.getOfficialEmail())) : null)
                .headName(school != null ? emptyToNull(PersonNameUtil.trim(school.getHeadName())) : null)
                .academicYear(AcademicYearUtil.currentLabel())
                .build();
    }

    private static String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
