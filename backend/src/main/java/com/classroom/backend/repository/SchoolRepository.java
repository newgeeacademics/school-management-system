package com.classroom.backend.repository;

import com.classroom.backend.model.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SchoolRepository extends JpaRepository<School, String> {
    boolean existsByRegistrationNumberIgnoreCase(String registrationNumber);
}
