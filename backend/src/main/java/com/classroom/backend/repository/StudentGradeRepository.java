package com.classroom.backend.repository;

import com.classroom.backend.model.StudentGrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentGradeRepository extends JpaRepository<StudentGrade, String> {
    List<StudentGrade> findByEvaluationId(String evaluationId);
    List<StudentGrade> findByStudentId(String studentId);
    Optional<StudentGrade> findByEvaluationIdAndStudentId(String evaluationId, String studentId);

    @Query("SELECT g FROM StudentGrade g WHERE g.evaluation.id IN :evaluationIds AND g.student.id IN :studentIds")
    List<StudentGrade> findByEvaluationIdInAndStudentIdIn(
            @Param("evaluationIds") Collection<String> evaluationIds,
            @Param("studentIds") Collection<String> studentIds);

    @Query("SELECT g FROM StudentGrade g WHERE g.student.id IN :studentIds")
    List<StudentGrade> findByStudentIdIn(@Param("studentIds") Collection<String> studentIds);
}
