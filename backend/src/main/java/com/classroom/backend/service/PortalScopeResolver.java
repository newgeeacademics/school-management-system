package com.classroom.backend.service;

import com.classroom.backend.model.*;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PortalScopeResolver {

    private final AppUserRepository appUserRepository;
    private final AccountIdentifierService accountIdentifierService;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final ParentContactRepository parentContactRepository;
    private final ClassItemRepository classItemRepository;

    public record PortalScope(
            AppUser user,
            UserRole role,
            List<ClassItem> classes,
            List<Student> students
    ) {
        public boolean canEdit() {
            return role == UserRole.TEACHER;
        }

        public Set<String> classIds() {
            return classes.stream().map(ClassItem::getId).collect(Collectors.toSet());
        }

        public Set<String> studentIds() {
            return students.stream().map(Student::getId).collect(Collectors.toSet());
        }

        public void assertCanEdit() {
            if (!canEdit()) {
                throw new IllegalStateException("Seuls les enseignants peuvent modifier les notes.");
            }
        }

        public void assertClassAccessible(String classId) {
            if (classId == null || classId.isBlank() || !classIds().contains(classId)) {
                throw new IllegalStateException("Classe non accessible.");
            }
        }

        public void assertStudentAccessible(String studentId) {
            if (studentId == null || studentId.isBlank() || !studentIds().contains(studentId)) {
                throw new IllegalStateException("Élève non accessible.");
            }
        }
    }

    public Teacher resolveTeacherForCurrentUser() {
        AppUser user = resolveCurrentUser();
        if (user.getRole() != UserRole.TEACHER) {
            throw new IllegalStateException("Seuls les enseignants peuvent effectuer cette action.");
        }
        return teacherRepository.findByAppUser_Id(user.getId())
                .or(() -> teacherRepository.findByEmailIgnoreCase(user.getEmail()))
                .orElseThrow(() -> new IllegalStateException(
                        "Aucun profil enseignant lié à ce compte."));
    }

    public PortalScope resolveForCurrentUser() {
        AppUser user = resolveCurrentUser();
        UserRole role = user.getRole();

        List<ClassItem> classes = new ArrayList<>();
        List<Student> students = new ArrayList<>();

        switch (role) {
            case TEACHER -> resolveTeacherScope(user, classes, students);
            case STUDENT -> resolveStudentScope(user, classes, students);
            case PARENT -> resolveParentScope(user, classes, students);
            default -> throw new IllegalArgumentException("Portal access is not available for role: " + role);
        }

        return new PortalScope(user, role, classes, students);
    }

    private AppUser resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new IllegalStateException("Not authenticated");
        }
        return accountIdentifierService.requireByPrincipalName(auth.getName());
    }

    private void resolveTeacherScope(AppUser user, List<ClassItem> classes, List<Student> students) {
        Teacher teacher = teacherRepository.findByAppUser_Id(user.getId())
                .or(() -> teacherRepository.findByEmailIgnoreCase(user.getEmail()))
                .orElseThrow(() -> new IllegalStateException(
                        "Aucun profil enseignant lié à ce compte. Recréez l'enseignant depuis le tableau de bord avec email et mot de passe."));

        List<ClassItem> homeroom = classItemRepository.findByHomeroomTeacherId(teacher.getId());
        classes.addAll(homeroom);

        for (ClassItem clazz : homeroom) {
            students.addAll(studentRepository.findByClassItemId(clazz.getId()));
        }

        students.sort(Comparator.comparing(Student::getName, String.CASE_INSENSITIVE_ORDER));
    }

    private void resolveStudentScope(AppUser user, List<ClassItem> classes, List<Student> students) {
        Student student = studentRepository.findByAppUser_Id(user.getId())
                .or(() -> studentRepository.findByEmailIgnoreCase(user.getEmail()))
                .orElseThrow(() -> new IllegalStateException(
                        "Aucun profil élève lié à ce compte. Recréez l'élève depuis le tableau de bord avec email et mot de passe."));

        students.add(student);
        if (student.getClassItem() != null) {
            classes.add(student.getClassItem());
        }
    }

    private void resolveParentScope(AppUser user, List<ClassItem> classes, List<Student> students) {
        List<ParentContact> parents = parentContactRepository.findAllByAppUser_Id(user.getId());
        if (parents.isEmpty()) {
            parents = parentContactRepository.findByEmailIgnoreCase(user.getEmail());
        }

        if (parents.isEmpty()) {
            throw new IllegalStateException(
                    "Aucun profil parent lié à ce compte. Recréez le parent depuis le tableau de bord avec email et mot de passe.");
        }

        Set<String> seenStudents = new HashSet<>();
        Set<String> seenClasses = new HashSet<>();

        for (ParentContact parent : parents) {
            Student child = parent.getStudent();
            if (child == null || !seenStudents.add(child.getId())) {
                continue;
            }
            students.add(child);
            ClassItem clazz = child.getClassItem();
            if (clazz != null && seenClasses.add(clazz.getId())) {
                classes.add(clazz);
            }
        }
    }
}
