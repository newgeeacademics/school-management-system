package com.classroom.backend.service;

import com.classroom.backend.dto.response.PortalFeedResponse;
import com.classroom.backend.dto.response.PortalFeedResponse.*;
import com.classroom.backend.model.*;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortalService {

    private final AppUserRepository appUserRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final ParentContactRepository parentContactRepository;
    private final ClassItemRepository classItemRepository;
    private final ScheduleItemRepository scheduleItemRepository;
    private final StudentGradeRepository studentGradeRepository;
    private final CanteenMenuItemRepository canteenMenuItemRepository;
    private final TransportRouteRepository transportRouteRepository;
    private final CalendarEventRepository calendarEventRepository;
    private final SchoolRepository schoolRepository;

    @Transactional(readOnly = true)
    public PortalFeedResponse getFeedForCurrentUser() {
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

        Set<String> classIds = classes.stream().map(ClassItem::getId).collect(Collectors.toSet());
        Set<String> studentIds = students.stream().map(Student::getId).collect(Collectors.toSet());

        Map<String, String> classNames = classes.stream()
                .collect(Collectors.toMap(ClassItem::getId, ClassItem::getName, (a, b) -> a));

        return PortalFeedResponse.builder()
                .role(role.name())
                .profileName(user.getName())
                .classes(classes.stream().map(this::toClassDto).toList())
                .students(students.stream().map(s -> toStudentDto(s, classNames)).toList())
                .schedule(filterSchedule(classIds))
                .grades(filterGrades(studentIds))
                .canteen(canteenMenuItemRepository.findAll().stream().map(this::toCanteenDto).toList())
                .transport(filterTransport(studentIds))
                .events(calendarEventRepository.findAll().stream().map(this::toEventDto).toList())
                .schools(schoolRepository.findAll().stream().map(this::toSchoolDto).toList())
                .build();
    }

    private AppUser resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new IllegalStateException("Not authenticated");
        }
        return appUserRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));
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
            parents = parentContactRepository.findByAppUser_Id(user.getId())
                    .map(List::of)
                    .orElseGet(() -> parentContactRepository.findByEmailIgnoreCase(user.getEmail()));
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

    private List<PortalScheduleDto> filterSchedule(Set<String> classIds) {
        if (classIds.isEmpty()) {
            return List.of();
        }
        return scheduleItemRepository.findAll().stream()
                .filter(item -> item.getClassItem() != null && classIds.contains(item.getClassItem().getId()))
                .map(item -> PortalScheduleDto.builder()
                        .id(item.getId())
                        .day(item.getDay())
                        .time(item.getTime())
                        .room(item.getRoom())
                        .className(item.getClassItem().getName())
                        .courseName(item.getCourse() != null ? item.getCourse().getName() : null)
                        .build())
                .toList();
    }

    private List<PortalGradeDto> filterGrades(Set<String> studentIds) {
        if (studentIds.isEmpty()) {
            return List.of();
        }
        return studentGradeRepository.findAll().stream()
                .filter(g -> g.getStudent() != null && studentIds.contains(g.getStudent().getId()))
                .map(g -> PortalGradeDto.builder()
                        .id(g.getId())
                        .score(g.getScore())
                        .studentName(g.getStudent().getName())
                        .evaluationLabel(g.getEvaluation() != null ? g.getEvaluation().getLabel() : null)
                        .build())
                .toList();
    }

    private List<PortalTransportDto> filterTransport(Set<String> studentIds) {
        if (studentIds.isEmpty()) {
            return List.of();
        }
        return transportRouteRepository.findAll().stream()
                .filter(route -> route.getStudents() != null && route.getStudents().stream()
                        .anyMatch(s -> studentIds.contains(s.getId())))
                .map(route -> PortalTransportDto.builder()
                        .id(route.getId())
                        .name(route.getName())
                        .driverName(route.getDriverName())
                        .departureTime(route.getDepartureTime())
                        .returnTime(route.getReturnTime())
                        .build())
                .toList();
    }

    private PortalClassDto toClassDto(ClassItem c) {
        Teacher teacher = c.getHomeroomTeacher();
        return PortalClassDto.builder()
                .id(c.getId())
                .name(c.getName())
                .level(c.getLevel())
                .studentsCount(c.getStudentsCount())
                .homeroomTeacherId(teacher != null ? teacher.getId() : null)
                .homeroomTeacherName(teacher != null ? teacher.getName() : null)
                .homeroomTeacherSubject(teacher != null ? teacher.getSubject() : null)
                .homeroomTeacherPhone(teacher != null ? teacher.getPhone() : null)
                .homeroomTeacherEmail(teacher != null ? teacher.getEmail() : null)
                .build();
    }

    private PortalStudentDto toStudentDto(Student s, Map<String, String> classNames) {
        String classId = s.getClassItem() != null ? s.getClassItem().getId() : null;
        return PortalStudentDto.builder()
                .id(s.getId())
                .name(s.getName())
                .classId(classId)
                .className(classId != null ? classNames.getOrDefault(classId,
                        s.getClassItem() != null ? s.getClassItem().getName() : null) : null)
                .build();
    }

    private PortalCanteenDto toCanteenDto(CanteenMenuItem item) {
        return PortalCanteenDto.builder()
                .id(item.getId())
                .day(item.getDay())
                .mealType(item.getMealType() != null ? item.getMealType().name() : null)
                .dish(item.getDish())
                .note(item.getNote())
                .build();
    }

    private PortalEventDto toEventDto(CalendarEvent event) {
        return PortalEventDto.builder()
                .id(event.getId())
                .label(event.getLabel())
                .date(event.getDate())
                .time(event.getTime())
                .location(event.getLocation())
                .build();
    }

    private PortalSchoolDto toSchoolDto(School school) {
        return PortalSchoolDto.builder()
                .id(school.getId())
                .name(school.getName())
                .city(school.getCity())
                .country(school.getCountry())
                .officialEmail(school.getOfficialEmail())
                .build();
    }
}
