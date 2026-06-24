package com.classroom.backend.service;

import com.classroom.backend.dto.request.StudentRequest;
import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.ClassItem;
import com.classroom.backend.model.Student;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.ClassItemRepository;
import com.classroom.backend.repository.StudentRepository;
import com.classroom.backend.util.IdCardNumberUtil;
import com.classroom.backend.util.MatriculeGenerator;
import com.classroom.backend.util.PersonNameUtil;
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
    private final SchoolContextService schoolContextService;

    public List<Student> findAll() {
        return schoolContextService.getCurrentSchoolId()
                .map(studentRepository::findBySchoolId)
                .orElseGet(studentRepository::findAll);
    }

    public Student findById(String id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));
        schoolContextService.assertSchoolAccess(student.getSchoolId());
        return student;
    }

    public List<Student> findByClassId(String classId) {
        return findAll().stream()
                .filter(s -> s.getClassItem() != null && classId.equals(s.getClassItem().getId()))
                .toList();
    }

    @Transactional
    public Student create(StudentRequest request) {
        String fullName = PersonNameUtil.requireFullName(
                request.getFirstName(), request.getLastName(), request.getName());

        ClassItem classItem = null;
        String schoolId = schoolContextService.getCurrentSchoolId().orElse(null);
        if (request.getClassId() != null && !request.getClassId().isBlank()) {
            classItem = classItemRepository.findById(request.getClassId()).orElse(null);
            if (classItem != null) {
                schoolContextService.assertSchoolAccess(classItem.getSchoolId());
                if (schoolId == null && classItem.getSchoolId() != null) {
                    schoolId = classItem.getSchoolId();
                }
            }
        }

        AppUser appUser = portalAccountService.createLinkedAccountForPerson(
                request.getFirstName(), request.getLastName(), fullName,
                request.getEmail(), request.getPhone(),
                request.getPassword(), UserRole.STUDENT);

        String matricule = MatriculeGenerator.next(studentRepository, classItem);

        Student student = Student.builder()
                .name(fullName)
                .firstName(PersonNameUtil.trim(request.getFirstName()))
                .lastName(PersonNameUtil.trim(request.getLastName()))
                .matricule(matricule)
                .idCardNumber(IdCardNumberUtil.resolveStudentCardNumber(
                        request.getIdCardNumber(), matricule, null))
                .email(appUser != null ? appUser.getEmail() : null)
                .classItem(classItem)
                .appUser(appUser)
                .schoolId(schoolId)
                .build();

        if (student.getIdCardNumber() == null || student.getIdCardNumber().isBlank()) {
            student.setIdCardNumber(IdCardNumberUtil.resolveStudentCardNumber(null, matricule, student.getId()));
        }

        return studentRepository.save(student);
    }

    @Transactional
    public Student update(String id, StudentRequest request) {
        Student student = findById(id);
        String fullName = PersonNameUtil.requireFullName(
                request.getFirstName(), request.getLastName(), request.getName());

        student.setName(fullName);
        student.setFirstName(PersonNameUtil.trim(request.getFirstName()));
        student.setLastName(PersonNameUtil.trim(request.getLastName()));
        student.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);

        if (request.getIdCardNumber() != null && !request.getIdCardNumber().isBlank()) {
            student.setIdCardNumber(request.getIdCardNumber().trim());
        }

        if (request.getClassId() != null && !request.getClassId().isBlank()) {
            ClassItem classItem = classItemRepository.findById(request.getClassId()).orElse(null);
            if (classItem != null) {
                schoolContextService.assertSchoolAccess(classItem.getSchoolId());
            }
            student.setClassItem(classItem);
        } else {
            student.setClassItem(null);
        }

        if (student.getAppUser() != null) {
            portalAccountService.syncLinkedAccount(
                    student.getAppUser(), fullName, request.getEmail(),
                    request.getPhone(), request.getPassword());
        } else if ((request.getEmail() != null && !request.getEmail().isBlank())
                || (request.getPhone() != null && !request.getPhone().isBlank())
                || PersonNameUtil.hasFirstAndLast(request.getFirstName(), request.getLastName())) {
            AppUser appUser = portalAccountService.createLinkedAccountForPerson(
                    request.getFirstName(), request.getLastName(), fullName,
                    request.getEmail(), request.getPhone(),
                    request.getPassword(), UserRole.STUDENT);
            student.setAppUser(appUser);
            if (appUser != null) {
                student.setEmail(appUser.getEmail());
            }
        }

        if (student.getMatricule() == null || student.getMatricule().isBlank()) {
            student.setMatricule(MatriculeGenerator.next(studentRepository, student.getClassItem()));
        }

        if (student.getIdCardNumber() == null || student.getIdCardNumber().isBlank()) {
            student.setIdCardNumber(IdCardNumberUtil.resolveStudentCardNumber(
                    null, student.getMatricule(), student.getId()));
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
