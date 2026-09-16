package com.classroom.backend.repository;

import com.classroom.backend.model.RollCallSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RollCallSessionRepository extends JpaRepository<RollCallSession, String> {

    Optional<RollCallSession> findByClassItem_IdAndDate(String classId, String date);
}
