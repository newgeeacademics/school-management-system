package com.classroom.backend.service;

import com.classroom.backend.dto.request.ClassItemRequest;
import com.classroom.backend.model.ClassItem;
import com.classroom.backend.model.Teacher;
import com.classroom.backend.repository.ClassItemRepository;
import com.classroom.backend.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassItemRepository classItemRepository;
    private final TeacherRepository teacherRepository;

    public List<ClassItem> findAll() {
        return classItemRepository.findAll();
    }

    public ClassItem findById(String id) {
        return classItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found: " + id));
    }

    public List<ClassItem> findByLevel(String level) {
        return classItemRepository.findByLevel(level);
    }

    @Transactional
    public ClassItem create(ClassItemRequest request) {
        Teacher homeroomTeacher = null;
        if (request.getHomeroomTeacherId() != null && !request.getHomeroomTeacherId().isBlank()) {
            homeroomTeacher = teacherRepository.findById(request.getHomeroomTeacherId())
                    .orElse(null);
        }

        ClassItem classItem = ClassItem.builder()
                .name(request.getName())
                .level(request.getLevel())
                .studentsCount(request.getStudentsCount())
                .homeroomTeacher(homeroomTeacher)
                .build();

        return classItemRepository.save(classItem);
    }

    @Transactional
    public ClassItem update(String id, ClassItemRequest request) {
        ClassItem classItem = findById(id);
        classItem.setName(request.getName());
        classItem.setLevel(request.getLevel());
        classItem.setStudentsCount(request.getStudentsCount());

        if (request.getHomeroomTeacherId() != null && !request.getHomeroomTeacherId().isBlank()) {
            Teacher teacher = teacherRepository.findById(request.getHomeroomTeacherId()).orElse(null);
            classItem.setHomeroomTeacher(teacher);
        } else {
            classItem.setHomeroomTeacher(null);
        }

        return classItemRepository.save(classItem);
    }

    @Transactional
    public void delete(String id) {
        classItemRepository.deleteById(id);
    }
}
