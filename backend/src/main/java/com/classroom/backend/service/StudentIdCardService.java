package com.classroom.backend.service;

import com.classroom.backend.dto.response.StudentIdCardResponse;
import com.classroom.backend.model.ClassItem;
import com.classroom.backend.model.School;
import com.classroom.backend.model.Student;
import com.classroom.backend.repository.SchoolRepository;
import com.classroom.backend.repository.StudentRepository;
import com.classroom.backend.util.MatriculeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentIdCardService {

    private final StudentRepository studentRepository;
    private final SchoolRepository schoolRepository;

    @Transactional
    public StudentIdCardResponse getIdCard(String studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        if (student.getMatricule() == null || student.getMatricule().isBlank()) {
            student.setMatricule(MatriculeGenerator.next(studentRepository, student.getClassItem()));
            student = studentRepository.save(student);
        }

        ClassItem clazz = student.getClassItem();
        String schoolName = schoolRepository.findAll().stream()
                .findFirst()
                .map(School::getName)
                .orElse("Établissement scolaire");

        String qrPayload = "{\"studentId\":\"" + student.getId()
                + "\",\"matricule\":\"" + student.getMatricule() + "\"}";

        return StudentIdCardResponse.builder()
                .studentId(student.getId())
                .matricule(student.getMatricule())
                .studentName(student.getName())
                .className(clazz != null ? clazz.getName() : null)
                .schoolName(schoolName)
                .qrPayload(qrPayload)
                .build();
    }
}
