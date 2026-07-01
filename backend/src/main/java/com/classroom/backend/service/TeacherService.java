package com.classroom.backend.service;

import com.classroom.backend.dto.request.TeacherRequest;
import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.ClassItem;
import com.classroom.backend.model.Teacher;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.ClassItemRepository;
import com.classroom.backend.repository.TeacherRepository;
import com.classroom.backend.util.PersonNameUtil;
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
    private final ClassItemRepository classItemRepository;
    private final PortalAccountService portalAccountService;
    private final SchoolContextService schoolContextService;
    private final TeacherStaffIdService teacherStaffIdService;

    public List<Teacher> findAll() {
        return schoolContextService.getCurrentSchoolId()
                .map(teacherRepository::findBySchoolId)
                .orElseGet(teacherRepository::findAll);
    }

    public Teacher findById(String id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + id));
        schoolContextService.assertSchoolAccess(teacher.getSchoolId());
        return teacher;
    }

    @Transactional
    public Teacher create(TeacherRequest request) {
        String fullName = PersonNameUtil.requireFullName(
                request.getFirstName(), request.getLastName(), request.getName());

        String schoolId = schoolContextService.getCurrentSchoolId().orElse(null);

        AppUser appUser = portalAccountService.createLinkedAccountForPerson(
                resolveFirstName(request), resolveLastName(request), fullName,
                request.getEmail(), request.getPhone(),
                request.getPassword(), UserRole.TEACHER);

        String requestedStaffId = request.getStaffId() != null && !request.getStaffId().isBlank()
                ? request.getStaffId().trim()
                : null;
        teacherStaffIdService.assertStaffIdAvailable(requestedStaffId, null);

        Teacher teacher = Teacher.builder()
                .name(fullName)
                .firstName(PersonNameUtil.trim(request.getFirstName()))
                .lastName(PersonNameUtil.trim(request.getLastName()))
                .initials(generateInitials(fullName))
                .subject(request.getSubject())
                .staffId(requestedStaffId)
                .email(appUser != null ? appUser.getEmail() : null)
                .phone(trimPhone(request.getPhone()))
                .appUser(appUser)
                .schoolId(schoolId)
                .build();

        teacher = teacherRepository.save(teacher);
        if (teacher.getStaffId() == null || teacher.getStaffId().isBlank()) {
            teacher.setStaffId(teacherStaffIdService.allocateNextStaffId());
            teacher = teacherRepository.save(teacher);
        }
        syncHomeroomClasses(teacher, request.getHomeroomClassIds());
        return teacher;
    }

    @Transactional
    public Teacher update(String id, TeacherRequest request) {
        Teacher teacher = findById(id);
        String fullName = PersonNameUtil.requireFullName(
                request.getFirstName(), request.getLastName(), request.getName());

        teacher.setName(fullName);
        teacher.setFirstName(PersonNameUtil.trim(request.getFirstName()));
        teacher.setLastName(PersonNameUtil.trim(request.getLastName()));
        teacher.setInitials(generateInitials(fullName));
        teacher.setSubject(request.getSubject());
        teacher.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        teacher.setPhone(trimPhone(request.getPhone()));

        if (request.getStaffId() != null && !request.getStaffId().isBlank()) {
            String staffId = request.getStaffId().trim();
            teacherStaffIdService.assertStaffIdAvailable(staffId, teacher.getId());
            teacher.setStaffId(staffId);
        } else if (teacher.getStaffId() == null || teacher.getStaffId().isBlank()) {
            teacher.setStaffId(teacherStaffIdService.allocateNextStaffId());
        }

        if (teacher.getAppUser() != null) {
            portalAccountService.syncLinkedAccount(
                    teacher.getAppUser(), fullName, request.getEmail(),
                    request.getPhone(), request.getPassword());
        } else if ((request.getEmail() != null && !request.getEmail().isBlank())
                || (request.getPhone() != null && !request.getPhone().isBlank())) {
            AppUser appUser = portalAccountService.createLinkedAccountForPerson(
                    resolveFirstName(request), resolveLastName(request), fullName,
                    request.getEmail(), request.getPhone(),
                    request.getPassword(), UserRole.TEACHER);
            teacher.setAppUser(appUser);
            if (appUser != null) {
                teacher.setEmail(appUser.getEmail());
            }
        }

        teacher = teacherRepository.save(teacher);
        if (request.getHomeroomClassIds() != null) {
            syncHomeroomClasses(teacher, request.getHomeroomClassIds());
        }
        return teacher;
    }

    @Transactional
    public void delete(String id) {
        Teacher teacher = findById(id);
        syncHomeroomClasses(teacher, List.of());
        AppUser linked = teacher.getAppUser();
        teacherRepository.delete(teacher);
        portalAccountService.deleteLinkedAccount(linked);
    }

    private void syncHomeroomClasses(Teacher teacher, List<String> classIds) {
        List<String> ids = classIds != null ? classIds : List.of();
        List<ClassItem> currentlyAssigned = classItemRepository.findByHomeroomTeacherId(teacher.getId());
        for (ClassItem clazz : currentlyAssigned) {
            if (!ids.contains(clazz.getId())) {
                clazz.setHomeroomTeacher(null);
                classItemRepository.save(clazz);
            }
        }
        for (String classId : ids) {
            if (classId == null || classId.isBlank()) {
                continue;
            }
            classItemRepository.findById(classId).ifPresent(clazz -> {
                schoolContextService.assertSchoolAccess(clazz.getSchoolId());
                clazz.setHomeroomTeacher(teacher);
                classItemRepository.save(clazz);
            });
        }
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

    private String resolveFirstName(TeacherRequest request) {
        String first = PersonNameUtil.trim(request.getFirstName());
        if (!first.isEmpty()) {
            return first;
        }
        if (request.getName() == null || request.getName().isBlank()) {
            return "";
        }
        String[] parts = request.getName().trim().split("\\s+", 2);
        return parts[0];
    }

    private String resolveLastName(TeacherRequest request) {
        String last = PersonNameUtil.trim(request.getLastName());
        if (!last.isEmpty()) {
            return last;
        }
        if (request.getName() == null || request.getName().isBlank()) {
            return "";
        }
        String[] parts = request.getName().trim().split("\\s+", 2);
        return parts.length > 1 ? parts[1] : "";
    }
}
