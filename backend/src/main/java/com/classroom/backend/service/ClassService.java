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
        return schoolContextService.getCurrentSchoolId()
                .map(classItemRepository::findBySchoolId)
                .orElseGet(classItemRepository::findAll);
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
        String schoolId = schoolContextService.getCurrentSchoolId().orElse(null);

        Teacher homeroomTeacher = null;
        if (request.getHomeroomTeacherId() != null && !request.getHomeroomTeacherId().isBlank()) {
            homeroomTeacher = teacherRepository.findById(request.getHomeroomTeacherId())
                    .orElse(null);
            if (homeroomTeacher != null) {
                schoolContextService.assertSchoolAccess(homeroomTeacher.getSchoolId());
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
                schoolContextService.assertSchoolAccess(teacher.getSchoolId());
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
