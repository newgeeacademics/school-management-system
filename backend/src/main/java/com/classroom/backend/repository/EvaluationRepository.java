package com.classroom.backend.repository;

import com.classroom.backend.model.Evaluation;
import com.classroom.backend.model.enums.EvaluationPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, String> {
    List<Evaluation> findByClassItemId(String classId);
    List<Evaluation> findByCourseId(String courseId);
    List<Evaluation> findByPeriod(EvaluationPeriod period);
    List<Evaluation> findByClassItemIdAndPeriod(String classId, EvaluationPeriod period);
}
