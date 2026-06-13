package com.classroom.backend.repository;

import com.classroom.backend.model.SchoolMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchoolMessageRepository extends JpaRepository<SchoolMessage, String> {

    List<SchoolMessage> findAllByOrderBySentAtDesc();
}
