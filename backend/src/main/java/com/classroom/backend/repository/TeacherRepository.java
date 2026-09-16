package com.classroom.backend.repository;

import com.classroom.backend.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, String> {
    List<Teacher> findBySubject(String subject);

    Optional<Teacher> findByAppUser_Id(String appUserId);

    Optional<Teacher> findByEmailIgnoreCase(String email);

    Optional<Teacher> findByPhone(String phone);

    List<Teacher> findBySchoolId(String schoolId);

    boolean existsByStaffId(String staffId);

    Optional<Teacher> findByStaffId(String staffId);

    @Query("SELECT DISTINCT t FROM Teacher t JOIN t.assignedClasses c WHERE c.id = :classId")
    List<Teacher> findByAssignedClassId(@Param("classId") String classId);
}
