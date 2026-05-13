package com.classroom.backend.repository;

import com.classroom.backend.model.StudentGrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentGradeRepository extends JpaRepository<StudentGrade, String> {
    List<StudentGrade> findByEvaluationId(String evaluationId);
    List<StudentGrade> findByStudentId(String studentId);
    Optional<StudentGrade> findByEvaluationIdAndStudentId(String evaluationId, String studentId);
}
