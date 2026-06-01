package com.classroom.backend.service;

import com.classroom.backend.dto.request.StudentRequest;
import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.ClassItem;
import com.classroom.backend.model.Student;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.ClassItemRepository;
import com.classroom.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final ClassItemRepository classItemRepository;
    private final PortalAccountService portalAccountService;

    public List<Student> findAll() {
        return studentRepository.findAll();
    }

    public Student findById(String id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));
    }

    public List<Student> findByClassId(String classId) {
        return studentRepository.findByClassItemId(classId);
    }

    @Transactional
    public Student create(StudentRequest request) {
        ClassItem classItem = null;
        if (request.getClassId() != null && !request.getClassId().isBlank()) {
            classItem = classItemRepository.findById(request.getClassId()).orElse(null);
        }

        AppUser appUser = portalAccountService.createLinkedAccount(
                request.getName(), request.getEmail(), request.getPassword(), UserRole.STUDENT);

        Student student = Student.builder()
                .name(request.getName())
                .email(request.getEmail() != null ? request.getEmail().trim() : null)
                .classItem(classItem)
                .appUser(appUser)
                .build();

        return studentRepository.save(student);
    }

    @Transactional
    public Student update(String id, StudentRequest request) {
        Student student = findById(id);
        student.setName(request.getName());
        student.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);

        if (request.getClassId() != null && !request.getClassId().isBlank()) {
            ClassItem classItem = classItemRepository.findById(request.getClassId()).orElse(null);
            student.setClassItem(classItem);
        } else {
            student.setClassItem(null);
        }

        if (student.getAppUser() != null) {
            portalAccountService.syncLinkedAccount(
                    student.getAppUser(), request.getName(), request.getEmail(), request.getPassword());
        } else if (request.getEmail() != null && !request.getEmail().isBlank()) {
            AppUser appUser = portalAccountService.createLinkedAccount(
                    request.getName(), request.getEmail(), request.getPassword(), UserRole.STUDENT);
            student.setAppUser(appUser);
        }

        return studentRepository.save(student);
    }

    @Transactional
    public void delete(String id) {
        Student student = findById(id);
        AppUser linked = student.getAppUser();
        studentRepository.delete(student);
        portalAccountService.deleteLinkedAccount(linked);
    }
}
