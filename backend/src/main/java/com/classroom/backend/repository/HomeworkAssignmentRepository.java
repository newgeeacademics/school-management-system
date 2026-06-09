package com.classroom.backend.repository;

import com.classroom.backend.model.HomeworkAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomeworkAssignmentRepository extends JpaRepository<HomeworkAssignment, String> {
    List<HomeworkAssignment> findByClassItemIdOrderByDueDateAsc(String classId);
}
