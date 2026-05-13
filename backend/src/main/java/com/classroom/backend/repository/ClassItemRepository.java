package com.classroom.backend.repository;

import com.classroom.backend.model.ClassItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassItemRepository extends JpaRepository<ClassItem, String> {
    List<ClassItem> findByLevel(String level);
    List<ClassItem> findByHomeroomTeacherId(String teacherId);
}
