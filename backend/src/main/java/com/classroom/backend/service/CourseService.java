package com.classroom.backend.service;

import com.classroom.backend.dto.request.CourseRequest;
import com.classroom.backend.model.Course;
import com.classroom.backend.model.Matiere;
import com.classroom.backend.repository.CourseRepository;
import com.classroom.backend.repository.MatiereRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final MatiereRepository matiereRepository;

    public List<Course> findAll() {
        return courseRepository.findAll();
    }

    public Course findById(String id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found: " + id));
    }

    public List<Course> findByMatiereId(String matiereId) {
        return courseRepository.findByMatiereId(matiereId);
    }

    @Transactional
    public Course create(CourseRequest request) {
        Matiere matiere = null;
        String courseName = request.getName();

        if (request.getMatiereId() != null && !request.getMatiereId().isBlank()) {
            matiere = matiereRepository.findById(request.getMatiereId()).orElse(null);
            if (matiere != null && (courseName == null || courseName.isBlank())) {
                courseName = matiere.getName();
            }
        }

        Course course = Course.builder()
                .name(courseName != null ? courseName : "Unnamed Course")
                .matiere(matiere)
                .level(request.getLevel())
                .build();

        return courseRepository.save(course);
    }

    @Transactional
    public Course update(String id, CourseRequest request) {
        Course course = findById(id);
        course.setLevel(request.getLevel());

        if (request.getName() != null && !request.getName().isBlank()) {
            course.setName(request.getName());
        }

        if (request.getMatiereId() != null && !request.getMatiereId().isBlank()) {
            Matiere matiere = matiereRepository.findById(request.getMatiereId()).orElse(null);
            course.setMatiere(matiere);
        }

        return courseRepository.save(course);
    }

    @Transactional
    public void delete(String id) {
        courseRepository.deleteById(id);
    }
}
