package com.classroom.backend.repository;

import com.classroom.backend.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    List<Student> findByClassItemId(String classId);

    Optional<Student> findByAppUser_Id(String appUserId);

    Optional<Student> findByEmailIgnoreCase(String email);

    long countByMatriculeStartingWith(String prefix);

    List<Student> findBySchoolId(String schoolId);
}
