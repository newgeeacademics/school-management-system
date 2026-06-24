package com.classroom.backend.repository;

import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, String> {
    Optional<AppUser> findByEmail(String email);

    Optional<AppUser> findByEmailIgnoreCase(String email);

    Optional<AppUser> findByPhone(String phone);

    Optional<AppUser> findByLoginIdIgnoreCase(String loginId);

    boolean existsByLoginIdIgnoreCase(String loginId);

    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByPhone(String phone);
    List<AppUser> findByRole(UserRole role);
    List<AppUser> findBySchoolId(String schoolId);
}
