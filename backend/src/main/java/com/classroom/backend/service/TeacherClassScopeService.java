package com.classroom.backend.service;

import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.ClassItem;
import com.classroom.backend.model.Course;
import com.classroom.backend.model.ScheduleItem;
import com.classroom.backend.model.Student;
import com.classroom.backend.model.Teacher;
import com.classroom.backend.repository.ClassItemRepository;
import com.classroom.backend.repository.ScheduleItemRepository;
import com.classroom.backend.repository.StudentRepository;
import com.classroom.backend.repository.TeacherRepository;
import com.classroom.backend.util.PhoneAccountUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TeacherClassScopeService {

    private final TeacherRepository teacherRepository;
    private final ClassItemRepository classItemRepository;
    private final StudentRepository studentRepository;
    private final ScheduleItemRepository scheduleItemRepository;

    public Teacher requireTeacherForUser(AppUser user) {
        return resolveTeacherForUser(user)
                .orElseThrow(() -> new IllegalStateException(
                        "Aucun profil enseignant lié à ce compte. Vérifiez l'identifiant portail ou contactez l'administration."));
    }

    public java.util.Optional<Teacher> resolveTeacherForUser(AppUser user) {
        return teacherRepository.findByAppUser_Id(user.getId())
                .or(() -> teacherRepository.findByEmailIgnoreCase(user.getEmail()))
                .or(() -> lookupTeacherByPhone(user.getPhone()));
    }

    public List<ClassItem> classesForTeacher(Teacher teacher) {
        Set<String> classIds = new LinkedHashSet<>();

        for (ClassItem homeroom : homeroomClasses(teacher)) {
            classIds.add(homeroom.getId());
        }

        if (teacher.getAssignedClasses() != null) {
            for (ClassItem assigned : teacher.getAssignedClasses()) {
                if (assigned != null && sameSchool(teacher, assigned)) {
                    classIds.add(assigned.getId());
                }
            }
        }

        for (ScheduleItem item : scheduleItemRepository.findAll()) {
            if (!scheduleItemBelongsToTeacher(item, teacher)) {
                continue;
            }
            ClassItem clazz = item.getClassItem();
            if (clazz != null && sameSchool(teacher, clazz)) {
                classIds.add(clazz.getId());
            }
        }

        if (classIds.isEmpty()) {
            return List.of();
        }

        return classItemRepository.findAllById(classIds).stream()
                .sorted(Comparator.comparing(ClassItem::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    public List<Student> studentsForClasses(List<ClassItem> classes) {
        List<Student> students = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();
        for (ClassItem clazz : classes) {
            for (Student student : studentRepository.findByClassItemId(clazz.getId())) {
                if (seen.add(student.getId())) {
                    students.add(student);
                }
            }
        }
        students.sort(Comparator.comparing(Student::getName, String.CASE_INSENSITIVE_ORDER));
        return students;
    }

    public boolean scheduleItemBelongsToTeacher(ScheduleItem item, Teacher teacher) {
        if (item.getTeacher() != null) {
            return teacher.getId().equals(item.getTeacher().getId());
        }
        return courseMatchesTeacherSubject(item.getCourse(), teacher.getSubject());
    }

    private List<ClassItem> homeroomClasses(Teacher teacher) {
        List<ClassItem> homeroom = classItemRepository.findByHomeroomTeacherId(teacher.getId());
        if (teacher.getSchoolId() == null || teacher.getSchoolId().isBlank()) {
            return homeroom;
        }
        return homeroom.stream()
                .filter(clazz -> teacher.getSchoolId().equals(clazz.getSchoolId()))
                .toList();
    }

    private java.util.Optional<Teacher> lookupTeacherByPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return java.util.Optional.empty();
        }
        String normalized = PhoneAccountUtil.normalizePhone(phone);
        return teacherRepository.findByPhone(normalized)
                .or(() -> teacherRepository.findByPhone(phone.trim()));
    }

    private boolean sameSchool(Teacher teacher, ClassItem clazz) {
        if (teacher.getSchoolId() == null || teacher.getSchoolId().isBlank()) {
            return true;
        }
        if (clazz.getSchoolId() == null || clazz.getSchoolId().isBlank()) {
            return true;
        }
        return teacher.getSchoolId().equals(clazz.getSchoolId());
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
}
