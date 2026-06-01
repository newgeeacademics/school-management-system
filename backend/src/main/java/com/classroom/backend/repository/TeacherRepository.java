package com.classroom.backend.repository;

import com.classroom.backend.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, String> {
    List<Teacher> findBySubject(String subject);

    Optional<Teacher> findByAppUser_Id(String appUserId);

    Optional<Teacher> findByEmailIgnoreCase(String email);
}
