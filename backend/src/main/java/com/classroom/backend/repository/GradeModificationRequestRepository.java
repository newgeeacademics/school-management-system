package com.classroom.backend.repository;

import com.classroom.backend.model.GradeModificationRequest;
import com.classroom.backend.model.enums.GradeModificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GradeModificationRequestRepository extends JpaRepository<GradeModificationRequest, String> {

    List<GradeModificationRequest> findByStatusOrderByCreatedAtDesc(GradeModificationStatus status);

    List<GradeModificationRequest> findAllByOrderByCreatedAtDesc();

    List<GradeModificationRequest> findByRequestedBy_AppUser_IdOrderByCreatedAtDesc(String appUserId);

    boolean existsByEvaluation_IdAndStudent_IdAndStatus(
            String evaluationId, String studentId, GradeModificationStatus status);

    Optional<GradeModificationRequest> findByEvaluation_IdAndStudent_IdAndStatus(
            String evaluationId, String studentId, GradeModificationStatus status);
}
