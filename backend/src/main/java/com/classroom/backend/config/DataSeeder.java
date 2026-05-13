package com.classroom.backend.config;

import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (appUserRepository.count() == 0) {
            log.info("Seeding default admin user...");

            AppUser admin = AppUser.builder()
                    .name("Administrateur")
                    .email("admin@classroom.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(UserRole.ADMIN)
                    .build();
            appUserRepository.save(admin);

            AppUser teacher = AppUser.builder()
                    .name("Professeur Test")
                    .email("teacher@classroom.com")
                    .password(passwordEncoder.encode("teacher123"))
                    .role(UserRole.TEACHER)
                    .build();
            appUserRepository.save(teacher);

            AppUser parent = AppUser.builder()
                    .name("Parent Test")
                    .email("parent@classroom.com")
                    .password(passwordEncoder.encode("parent123"))
                    .role(UserRole.PARENT)
                    .build();
            appUserRepository.save(parent);

            AppUser student = AppUser.builder()
                    .name("Élève Test")
                    .email("student@classroom.com")
                    .password(passwordEncoder.encode("student123"))
                    .role(UserRole.STUDENT)
                    .build();
            appUserRepository.save(student);

            log.info("Default users created successfully.");
        }
    }
}
