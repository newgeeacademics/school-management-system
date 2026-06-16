package com.classroom.backend.service;

import com.classroom.backend.dto.response.TeacherIdCardResponse;
import com.classroom.backend.model.School;
import com.classroom.backend.model.Teacher;
import com.classroom.backend.repository.SchoolRepository;
import com.classroom.backend.repository.TeacherRepository;
import com.classroom.backend.util.AcademicYearUtil;
import com.classroom.backend.util.IdCardNumberUtil;
import com.classroom.backend.util.PersonNameUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TeacherIdCardService {

    private final TeacherRepository teacherRepository;
    private final SchoolRepository schoolRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public TeacherIdCardResponse getIdCard(String teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherId));

        if (teacher.getStaffId() == null || teacher.getStaffId().isBlank()) {
            teacher.setStaffId(IdCardNumberUtil.resolveTeacherStaffId(null, teacher.getId()));
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

        String qrPayload = buildQrPayload(teacher, schoolName, schoolCity);

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

    private String buildQrPayload(Teacher teacher, String schoolName, String schoolCity) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("type", "teacher");
        payload.put("teacherId", teacher.getId());
        payload.put("staffId", teacher.getStaffId());
        payload.put("name", teacher.getName());
        payload.put("subject", teacher.getSubject());
        payload.put("school", schoolName);
        if (!schoolCity.isEmpty()) {
            payload.put("city", schoolCity);
        }
        payload.put("academicYear", AcademicYearUtil.currentLabel());
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            return "{\"teacherId\":\"" + teacher.getId() + "\",\"staffId\":\"" + teacher.getStaffId() + "\"}";
        }
    }
}
