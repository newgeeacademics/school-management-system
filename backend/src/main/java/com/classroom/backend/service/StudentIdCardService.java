package com.classroom.backend.service;

import com.classroom.backend.dto.response.StudentIdCardResponse;
import com.classroom.backend.model.ClassItem;
import com.classroom.backend.model.ParentContact;
import com.classroom.backend.model.School;
import com.classroom.backend.model.Student;
import com.classroom.backend.model.Teacher;
import com.classroom.backend.repository.ParentContactRepository;
import com.classroom.backend.repository.SchoolRepository;
import com.classroom.backend.repository.StudentRepository;
import com.classroom.backend.util.AcademicYearUtil;
import com.classroom.backend.util.IdCardNumberUtil;
import com.classroom.backend.util.MatriculeGenerator;
import com.classroom.backend.util.PersonNameUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentIdCardService {

    private final StudentRepository studentRepository;
    private final SchoolRepository schoolRepository;
    private final ParentContactRepository parentContactRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public StudentIdCardResponse getIdCard(String studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        if (student.getMatricule() == null || student.getMatricule().isBlank()) {
            student.setMatricule(MatriculeGenerator.next(studentRepository, student.getClassItem()));
            student = studentRepository.save(student);
        }

        if (student.getIdCardNumber() == null || student.getIdCardNumber().isBlank()) {
            student.setIdCardNumber(IdCardNumberUtil.resolveStudentCardNumber(
                    null, student.getMatricule(), student.getId()));
            student = studentRepository.save(student);
        }

        ClassItem clazz = student.getClassItem();
        School school = schoolRepository.findAll().stream().findFirst().orElse(null);
        String schoolName = school != null ? school.getName() : "Établissement scolaire";
        String schoolCity = school != null ? PersonNameUtil.trim(school.getCity()) : "";

        String firstName = PersonNameUtil.trim(student.getFirstName());
        String lastName = PersonNameUtil.trim(student.getLastName());
        if (firstName.isEmpty() && lastName.isEmpty() && student.getName() != null) {
            String[] parts = student.getName().trim().split("\\s+", 2);
            firstName = parts.length > 0 ? parts[0] : student.getName();
            lastName = parts.length > 1 ? parts[1] : "";
        }

        String qrPayload = buildQrPayload(student, schoolName, schoolCity);

        return StudentIdCardResponse.builder()
                .studentId(student.getId())
                .matricule(student.getMatricule())
                .idCardNumber(student.getIdCardNumber())
                .firstName(firstName)
                .lastName(lastName)
                .studentName(student.getName())
                .className(clazz != null ? clazz.getName() : null)
                .schoolName(schoolName)
                .schoolCity(schoolCity.isEmpty() ? null : schoolCity)
                .academicYear(AcademicYearUtil.currentLabel())
                .qrPayload(qrPayload)
                .build();
    }

    private String buildQrPayload(Student student, String schoolName, String schoolCity) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("type", "student");
        payload.put("studentId", student.getId());
        payload.put("matricule", student.getMatricule());
        payload.put("idCardNumber", student.getIdCardNumber());
        payload.put("name", student.getName());
        payload.put("school", schoolName);
        if (!schoolCity.isEmpty()) {
            payload.put("city", schoolCity);
        }
        payload.put("academicYear", AcademicYearUtil.currentLabel());
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            return "{\"studentId\":\"" + student.getId() + "\",\"matricule\":\"" + student.getMatricule() + "\"}";
        }
    }

    /** Parent + homeroom teacher details for roster export (not printed on the physical card). */
    public RosterRowDetails rosterDetailsFor(Student student) {
        List<ParentContact> parents = parentContactRepository.findByStudentId(student.getId());
        ParentContact parent = parents.isEmpty() ? null : parents.get(0);

        ClassItem clazz = student.getClassItem();
        Teacher teacher = clazz != null ? clazz.getHomeroomTeacher() : null;

        return new RosterRowDetails(
                parent != null ? parent.getName() : "",
                parent != null ? PersonNameUtil.trim(parent.getPhone()) : "",
                parent != null ? PersonNameUtil.trim(parent.getEmail()) : "",
                teacher != null ? teacher.getName() : ""
        );
    }

    public record RosterRowDetails(
            String parentName,
            String parentPhone,
            String parentEmail,
            String homeroomTeacherName
    ) {
    }
}
