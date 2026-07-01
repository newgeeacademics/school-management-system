package com.classroom.backend.service;

import com.classroom.backend.dto.request.ClassItemRequest;
import com.classroom.backend.model.ClassItem;
import com.classroom.backend.model.Teacher;
import com.classroom.backend.repository.ClassItemRepository;
import com.classroom.backend.repository.TeacherRepository;
import com.classroom.backend.util.ClassCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassItemRepository classItemRepository;
    private final TeacherRepository teacherRepository;
    private final SchoolContextService schoolContextService;

    public List<ClassItem> findAll() {
        return schoolContextService.findAllForCurrentSchool(classItemRepository::findBySchoolId);
    }

    public ClassItem findById(String id) {
        ClassItem classItem = classItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found: " + id));
        schoolContextService.assertSchoolAccess(classItem.getSchoolId());
        return classItem;
    }

    public List<ClassItem> findByLevel(String level) {
        return findAll().stream()
                .filter(c -> level != null && level.equalsIgnoreCase(c.getLevel()))
                .toList();
    }

    @Transactional
    public ClassItem create(ClassItemRequest request) {
        String schoolId = schoolContextService.requireCurrentSchoolId();

        Teacher homeroomTeacher = null;
        if (request.getHomeroomTeacherId() != null && !request.getHomeroomTeacherId().isBlank()) {
            homeroomTeacher = teacherRepository.findById(request.getHomeroomTeacherId())
                    .orElse(null);
            if (homeroomTeacher != null) {
                schoolContextService.assertSameSchool(
                        homeroomTeacher.getSchoolId(),
                        schoolId,
                        "Le professeur principal doit appartenir à votre établissement.");
            }
        }

        ClassItem classItem = ClassItem.builder()
                .name(ClassCodeGenerator.ensureUniqueClassName(
                        request.getName(), findAll()))
                .level(request.getLevel())
                .studentsCount(request.getStudentsCount())
                .homeroomTeacher(homeroomTeacher)
                .schoolId(schoolId)
                .build();

        return classItemRepository.save(classItem);
    }

    @Transactional
    public ClassItem update(String id, ClassItemRequest request) {
        ClassItem classItem = findById(id);
        classItem.setName(ClassCodeGenerator.ensureUniqueClassName(
                request.getName(), findAll(), id));
        classItem.setLevel(request.getLevel());
        classItem.setStudentsCount(request.getStudentsCount());

        if (request.getHomeroomTeacherId() != null && !request.getHomeroomTeacherId().isBlank()) {
            Teacher teacher = teacherRepository.findById(request.getHomeroomTeacherId()).orElse(null);
            if (teacher != null) {
                schoolContextService.assertSameSchool(
                        teacher.getSchoolId(),
                        classItem.getSchoolId(),
                        "Le professeur principal doit appartenir à l'établissement de cette classe.");
            }
            classItem.setHomeroomTeacher(teacher);
        } else {
            classItem.setHomeroomTeacher(null);
        }

        return classItemRepository.save(classItem);
    }

    @Transactional
    public void delete(String id) {
        findById(id);
        classItemRepository.deleteById(id);
    }
}
