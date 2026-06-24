package com.classroom.backend.config;

import com.classroom.backend.model.*;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final SchoolRepository schoolRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final ParentContactRepository parentContactRepository;
    private final ClassItemRepository classItemRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }
        if (appUserRepository.count() == 0) {
            log.info("Seeding default school and portal users...");

            School school = schoolRepository.save(School.builder()
                    .name("École Démo Classroom")
                    .build());

            AppUser admin = AppUser.builder()
                    .name("Administrateur")
                    .email("admin@classroom.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(UserRole.ADMIN)
                    .schoolId(school.getId())
                    .build();
            appUserRepository.save(admin);

            AppUser teacherUser = AppUser.builder()
                    .name("Professeur Test")
                    .email("teacher@classroom.com")
                    .loginId("professeurtest1")
                    .password(passwordEncoder.encode("teacher123"))
                    .role(UserRole.TEACHER)
                    .schoolId(school.getId())
                    .build();
            appUserRepository.save(teacherUser);

            Teacher teacher = teacherRepository.save(Teacher.builder()
                    .name("Professeur Test")
                    .firstName("Professeur")
                    .lastName("Test")
                    .initials("PT")
                    .subject("Mathématiques")
                    .email(teacherUser.getEmail())
                    .appUser(teacherUser)
                    .schoolId(school.getId())
                    .build());

            ClassItem classItem = classItemRepository.save(ClassItem.builder()
                    .name("6ème A")
                    .level("Collège")
                    .studentsCount(1)
                    .homeroomTeacher(teacher)
                    .schoolId(school.getId())
                    .build());

            AppUser studentUser = AppUser.builder()
                    .name("Élève Test")
                    .email("student@classroom.com")
                    .loginId("elevetest1")
                    .password(passwordEncoder.encode("student123"))
                    .role(UserRole.STUDENT)
                    .schoolId(school.getId())
                    .build();
            appUserRepository.save(studentUser);

            Student student = studentRepository.save(Student.builder()
                    .name("Élève Test")
                    .firstName("Élève")
                    .lastName("Test")
                    .matricule("6A-001")
                    .email(studentUser.getEmail())
                    .classItem(classItem)
                    .appUser(studentUser)
                    .schoolId(school.getId())
                    .build());

            AppUser parentUser = AppUser.builder()
                    .name("Parent Test")
                    .email("parent@classroom.com")
                    .loginId("parenttest1")
                    .password(passwordEncoder.encode("parent123"))
                    .role(UserRole.PARENT)
                    .schoolId(school.getId())
                    .build();
            appUserRepository.save(parentUser);

            parentContactRepository.save(ParentContact.builder()
                    .name("Parent Test")
                    .firstName("Parent")
                    .lastName("Test")
                    .email(parentUser.getEmail())
                    .student(student)
                    .appUser(parentUser)
                    .schoolId(school.getId())
                    .build());

            log.info("Default school and portal users created successfully.");
        }
    }
}
