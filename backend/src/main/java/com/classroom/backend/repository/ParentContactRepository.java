package com.classroom.backend.repository;

import com.classroom.backend.model.ParentContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParentContactRepository extends JpaRepository<ParentContact, String> {
    List<ParentContact> findByStudentId(String studentId);

    Optional<ParentContact> findByAppUser_Id(String appUserId);

    List<ParentContact> findAllByAppUser_Id(String appUserId);

    long countByAppUser_Id(String appUserId);

    List<ParentContact> findByEmailIgnoreCase(String email);

    List<ParentContact> findBySchoolId(String schoolId);
}
