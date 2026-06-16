package com.classroom.backend.repository;

import com.classroom.backend.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, String> {

    Optional<Driver> findByAppUser_Id(String appUserId);

    Optional<Driver> findByEmailIgnoreCase(String email);
}
