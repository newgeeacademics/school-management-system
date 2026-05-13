package com.classroom.backend.repository;

import com.classroom.backend.model.ParentContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParentContactRepository extends JpaRepository<ParentContact, String> {
    List<ParentContact> findByStudentId(String studentId);
}
