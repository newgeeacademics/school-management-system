package com.classroom.backend.repository;

import com.classroom.backend.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
    List<Course> findByMatiereId(String matiereId);
    List<Course> findByLevel(String level);
}
