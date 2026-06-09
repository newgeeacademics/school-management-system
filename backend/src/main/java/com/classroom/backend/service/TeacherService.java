package com.classroom.backend.service;

import com.classroom.backend.dto.request.TeacherRequest;
import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.Teacher;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final PortalAccountService portalAccountService;

    public List<Teacher> findAll() {
        return teacherRepository.findAll();
    }

    public Teacher findById(String id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + id));
    }

    @Transactional
    public Teacher create(TeacherRequest request) {
        AppUser appUser = portalAccountService.createLinkedAccount(
                request.getName(), request.getEmail(), request.getPhone(),
                request.getPassword(), UserRole.TEACHER);

        Teacher teacher = Teacher.builder()
                .name(request.getName())
                .initials(generateInitials(request.getName()))
                .subject(request.getSubject())
                .email(request.getEmail() != null ? request.getEmail().trim() : null)
                .phone(trimPhone(request.getPhone()))
                .appUser(appUser)
                .build();

        return teacherRepository.save(teacher);
    }

    @Transactional
    public Teacher update(String id, TeacherRequest request) {
        Teacher teacher = findById(id);
        teacher.setName(request.getName());
        teacher.setInitials(generateInitials(request.getName()));
        teacher.setSubject(request.getSubject());
        teacher.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        teacher.setPhone(trimPhone(request.getPhone()));

        if (teacher.getAppUser() != null) {
            portalAccountService.syncLinkedAccount(
                    teacher.getAppUser(), request.getName(), request.getEmail(),
                    request.getPhone(), request.getPassword());
        } else if ((request.getEmail() != null && !request.getEmail().isBlank())
                || (request.getPhone() != null && !request.getPhone().isBlank())) {
            AppUser appUser = portalAccountService.createLinkedAccount(
                    request.getName(), request.getEmail(), request.getPhone(),
                    request.getPassword(), UserRole.TEACHER);
            teacher.setAppUser(appUser);
        }

        return teacherRepository.save(teacher);
    }

    @Transactional
    public void delete(String id) {
        Teacher teacher = findById(id);
        AppUser linked = teacher.getAppUser();
        teacherRepository.delete(teacher);
        portalAccountService.deleteLinkedAccount(linked);
    }

    private String trimPhone(String phone) {
        if (phone == null || phone.isBlank()) return null;
        return phone.trim();
    }

    private String generateInitials(String name) {
        return Arrays.stream(name.trim().split("\\s+"))
                .map(part -> part.substring(0, 1).toUpperCase())
                .collect(Collectors.joining());
    }
}
