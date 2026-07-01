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
    private final AccountIdentifierService accountIdentifierService;
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

        List<PortalScheduleDto> schedule = role == UserRole.TEACHER
                ? filterScheduleForTeacher(resolveTeacherProfile(user))
                : filterSchedule(classIds);

        return PortalFeedResponse.builder()
                .role(role.name())
                .profileName(user.getName())
                .classes(classes.stream().map(this::toClassDto).toList())
                .students(students.stream().map(s -> toStudentDto(s, classNames)).toList())
                .schedule(schedule)
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
        return accountIdentifierService.requireByPrincipalName(auth.getName());
    }

    private Teacher resolveTeacherProfile(AppUser user) {
        return teacherRepository.findByAppUser_Id(user.getId())
                .or(() -> teacherRepository.findByEmailIgnoreCase(user.getEmail()))
                .orElseThrow(() -> new IllegalStateException(
                        "Aucun profil enseignant lié à ce compte. Recréez l'enseignant depuis le tableau de bord avec email et mot de passe."));
    }

    private void resolveTeacherScope(AppUser user, List<ClassItem> classes, List<Student> students) {
        Teacher teacher = resolveTeacherProfile(user);

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

    private static final List<String> DAY_ORDER = List.of(
            "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche");

    private List<PortalScheduleDto> filterSchedule(Set<String> classIds) {
        if (classIds.isEmpty()) {
            return List.of();
        }
        return scheduleItemRepository.findAll().stream()
                .filter(item -> item.getClassItem() != null && classIds.contains(item.getClassItem().getId()))
                .map(this::toScheduleDto)
                .sorted(this::compareSchedule)
                .toList();
    }

    private List<PortalScheduleDto> filterScheduleForTeacher(Teacher teacher) {
        return scheduleItemRepository.findAll().stream()
                .filter(item -> scheduleItemBelongsToTeacher(item, teacher))
                .map(this::toScheduleDto)
                .sorted(this::compareSchedule)
                .toList();
    }

    private boolean scheduleItemBelongsToTeacher(ScheduleItem item, Teacher teacher) {
        if (item.getTeacher() != null) {
            return teacher.getId().equals(item.getTeacher().getId());
        }
        return courseMatchesTeacherSubject(item.getCourse(), teacher.getSubject());
    }

    private boolean courseMatchesTeacherSubject(Course course, String teacherSubject) {
        if (course == null || teacherSubject == null || teacherSubject.isBlank()) {
            return false;
        }
        String subjectKey = normalizeSubjectKey(teacherSubject);
        if (course.getMatiere() != null) {
            String matiereKey = normalizeSubjectKey(course.getMatiere().getName());
            if (subjectsMatch(subjectKey, matiereKey)) {
                return true;
            }
        }
        return subjectsMatch(subjectKey, normalizeSubjectKey(course.getName()));
    }

    private boolean subjectsMatch(String left, String right) {
        if (left.isEmpty() || right.isEmpty()) {
            return false;
        }
        return left.equals(right) || left.contains(right) || right.contains(left);
    }

    private String normalizeSubjectKey(String value) {
        if (value == null) {
            return "";
        }
        return value.trim()
                .toLowerCase(Locale.ROOT)
                .replace('é', 'e')
                .replace('è', 'e')
                .replace('ê', 'e')
                .replace('ë', 'e')
                .replace('à', 'a')
                .replace('â', 'a')
                .replace('ù', 'u')
                .replace('û', 'u')
                .replace('ô', 'o')
                .replace('î', 'i')
                .replace('ï', 'i')
                .replace('ç', 'c');
    }

    private PortalScheduleDto toScheduleDto(ScheduleItem item) {
        return PortalScheduleDto.builder()
                .id(item.getId())
                .day(item.getDay())
                .time(item.getTime())
                .room(item.getRoom())
                .className(item.getClassItem() != null ? item.getClassItem().getName() : null)
                .courseName(item.getCourse() != null ? item.getCourse().getName() : null)
                .build();
    }

    private int compareSchedule(PortalScheduleDto a, PortalScheduleDto b) {
        int dayCmp = Integer.compare(dayIndex(a.getDay()), dayIndex(b.getDay()));
        if (dayCmp != 0) {
            return dayCmp;
        }
        return timeSortKey(a.getTime()).compareTo(timeSortKey(b.getTime()));
    }

    private int dayIndex(String day) {
        if (day == null) {
            return 999;
        }
        int idx = DAY_ORDER.indexOf(day.trim());
        return idx >= 0 ? idx : 999;
    }

    private String timeSortKey(String time) {
        if (time == null || time.isBlank()) {
            return "99:99";
        }
        String normalized = time.trim().replace('h', ':');
        if (normalized.matches("\\d{1,2}:\\d{2}")) {
            String[] parts = normalized.split(":");
            return String.format("%02d:%02d", Integer.parseInt(parts[0]), Integer.parseInt(parts[1]));
        }
        return normalized;
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
