package com.classroom.backend.service;

import com.classroom.backend.dto.request.ParentContactRequest;
import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.ParentContact;
import com.classroom.backend.model.Student;
import com.classroom.backend.repository.ParentContactRepository;
import com.classroom.backend.repository.StudentRepository;
import com.classroom.backend.util.PersonNameUtil;
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
    private final SchoolContextService schoolContextService;

    public List<ParentContact> findAll() {
        return schoolContextService.findAllForCurrentSchool(parentContactRepository::findBySchoolId);
    }

    public ParentContact findById(String id) {
        ParentContact parent = parentContactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parent contact not found: " + id));
        schoolContextService.assertSchoolAccess(parent.getSchoolId());
        return parent;
    }

    public List<ParentContact> findByStudentId(String studentId) {
        return findAll().stream()
                .filter(p -> p.getStudent() != null && studentId.equals(p.getStudent().getId()))
                .toList();
    }

    @Transactional
    public ParentContact create(ParentContactRequest request) {
        String fullName = PersonNameUtil.requireFullName(
                request.getFirstName(), request.getLastName(), request.getName());

        Student student = null;
        String schoolId = schoolContextService.requireCurrentSchoolId();
        if (request.getStudentId() != null && !request.getStudentId().isBlank()) {
            student = studentRepository.findById(request.getStudentId()).orElse(null);
            if (student != null) {
                schoolContextService.assertSameSchool(
                        student.getSchoolId(),
                        schoolId,
                        "Cet élève n'appartient pas à votre établissement.");
            }
        }

        AppUser appUser = portalAccountService.findOrCreateParentAccount(
                request.getFirstName(), request.getLastName(), fullName,
                request.getEmail(), request.getPhone(), request.getPassword());

        ParentContact parent = ParentContact.builder()
                .name(fullName)
                .firstName(PersonNameUtil.trim(request.getFirstName()))
                .lastName(PersonNameUtil.trim(request.getLastName()))
                .phone(request.getPhone())
                .email(appUser != null ? appUser.getEmail() : null)
                .student(student)
                .appUser(appUser)
                .schoolId(schoolId)
                .build();

        return parentContactRepository.save(parent);
    }

    @Transactional
    public ParentContact update(String id, ParentContactRequest request) {
        ParentContact parent = findById(id);
        String fullName = PersonNameUtil.requireFullName(
                request.getFirstName(), request.getLastName(), request.getName());

        parent.setName(fullName);
        parent.setFirstName(PersonNameUtil.trim(request.getFirstName()));
        parent.setLastName(PersonNameUtil.trim(request.getLastName()));
        parent.setPhone(request.getPhone());
        parent.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);

        if (request.getStudentId() != null && !request.getStudentId().isBlank()) {
            Student student = studentRepository.findById(request.getStudentId()).orElse(null);
            if (student != null) {
                schoolContextService.assertSchoolAccess(student.getSchoolId());
            }
            parent.setStudent(student);
        } else {
            parent.setStudent(null);
        }

        if (parent.getAppUser() != null) {
            portalAccountService.syncLinkedAccount(
                    parent.getAppUser(), fullName, request.getEmail(),
                    request.getPhone(), request.getPassword());
        } else if (PersonNameUtil.hasFirstAndLast(request.getFirstName(), request.getLastName())
                || (request.getPhone() != null && !request.getPhone().isBlank())) {
            AppUser appUser = portalAccountService.findOrCreateParentAccount(
                    request.getFirstName(), request.getLastName(), fullName,
                    request.getEmail(), request.getPhone(), request.getPassword());
            parent.setAppUser(appUser);
        }

        return parentContactRepository.save(parent);
    }

    @Transactional
    public void delete(String id) {
        ParentContact parent = findById(id);
        AppUser linked = parent.getAppUser();
        parentContactRepository.delete(parent);
        if (linked != null && parentContactRepository.countByAppUser_Id(linked.getId()) == 0) {
            portalAccountService.deleteLinkedAccount(linked);
        }
    }
}
