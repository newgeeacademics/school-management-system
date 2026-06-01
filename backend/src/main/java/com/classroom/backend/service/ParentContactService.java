package com.classroom.backend.service;

import com.classroom.backend.dto.request.ParentContactRequest;
import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.ParentContact;
import com.classroom.backend.model.Student;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.ParentContactRepository;
import com.classroom.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParentContactService {

    private final ParentContactRepository parentContactRepository;
    private final StudentRepository studentRepository;
    private final PortalAccountService portalAccountService;

    public List<ParentContact> findAll() {
        return parentContactRepository.findAll();
    }

    public ParentContact findById(String id) {
        return parentContactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parent contact not found: " + id));
    }

    public List<ParentContact> findByStudentId(String studentId) {
        return parentContactRepository.findByStudentId(studentId);
    }

    @Transactional
    public ParentContact create(ParentContactRequest request) {
        Student student = null;
        if (request.getStudentId() != null && !request.getStudentId().isBlank()) {
            student = studentRepository.findById(request.getStudentId()).orElse(null);
        }

        AppUser appUser = portalAccountService.createLinkedAccount(
                request.getName(), request.getEmail(), request.getPassword(), UserRole.PARENT);

        ParentContact parent = ParentContact.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail() != null ? request.getEmail().trim() : null)
                .student(student)
                .appUser(appUser)
                .build();

        return parentContactRepository.save(parent);
    }

    @Transactional
    public ParentContact update(String id, ParentContactRequest request) {
        ParentContact parent = findById(id);
        parent.setName(request.getName());
        parent.setPhone(request.getPhone());
        parent.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);

        if (request.getStudentId() != null && !request.getStudentId().isBlank()) {
            Student student = studentRepository.findById(request.getStudentId()).orElse(null);
            parent.setStudent(student);
        } else {
            parent.setStudent(null);
        }

        if (parent.getAppUser() != null) {
            portalAccountService.syncLinkedAccount(
                    parent.getAppUser(), request.getName(), request.getEmail(), request.getPassword());
        } else if (request.getEmail() != null && !request.getEmail().isBlank()) {
            AppUser appUser = portalAccountService.createLinkedAccount(
                    request.getName(), request.getEmail(), request.getPassword(), UserRole.PARENT);
            parent.setAppUser(appUser);
        }

        return parentContactRepository.save(parent);
    }

    @Transactional
    public void delete(String id) {
        ParentContact parent = findById(id);
        AppUser linked = parent.getAppUser();
        parentContactRepository.delete(parent);
        portalAccountService.deleteLinkedAccount(linked);
    }
}
