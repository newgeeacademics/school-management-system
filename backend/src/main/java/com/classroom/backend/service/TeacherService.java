package com.classroom.backend.service;

import com.classroom.backend.dto.request.TeacherRequest;
import com.classroom.backend.model.Teacher;
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

    public List<Teacher> findAll() {
        return teacherRepository.findAll();
    }

    public Teacher findById(String id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + id));
    }

    @Transactional
    public Teacher create(TeacherRequest request) {
        String initials = generateInitials(request.getName());

        Teacher teacher = Teacher.builder()
                .name(request.getName())
                .initials(initials)
                .subject(request.getSubject())
                .build();

        return teacherRepository.save(teacher);
    }

    @Transactional
    public Teacher update(String id, TeacherRequest request) {
        Teacher teacher = findById(id);
        teacher.setName(request.getName());
        teacher.setInitials(generateInitials(request.getName()));
        teacher.setSubject(request.getSubject());
        return teacherRepository.save(teacher);
    }

    @Transactional
    public void delete(String id) {
        teacherRepository.deleteById(id);
    }

    private String generateInitials(String name) {
        return Arrays.stream(name.trim().split("\\s+"))
                .map(part -> part.substring(0, 1).toUpperCase())
                .collect(Collectors.joining());
    }
}
