package com.classroom.backend.service;

import com.classroom.backend.dto.request.HomeworkRequest;
import com.classroom.backend.dto.request.RollCallRequest;
import com.classroom.backend.dto.response.PortalClassDetailResponse;
import com.classroom.backend.dto.response.PortalClassDetailResponse.PortalStudentRow;
import com.classroom.backend.dto.response.PortalDirectoryResponse;
import com.classroom.backend.dto.response.PortalDirectoryResponse.PortalTeacherContactDto;
import com.classroom.backend.dto.response.PortalHomeworkResponse;
import com.classroom.backend.dto.response.PortalHomeworkResponse.PortalHomeworkDto;
import com.classroom.backend.dto.response.PortalRollCallResponse;
import com.classroom.backend.dto.response.PortalRollCallResponse.PortalRollCallRow;
import com.classroom.backend.model.*;
import com.classroom.backend.model.enums.AttendanceStatus;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortalClassHubService {

    private final PortalScopeResolver portalScopeResolver;
    private final ClassItemRepository classItemRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final HomeworkAssignmentRepository homeworkAssignmentRepository;
    private final TeacherRepository teacherRepository;

    @Transactional(readOnly = true)
    public PortalClassDetailResponse getClassDetail(String classId) {
        PortalScopeResolver.PortalScope scope = portalScopeResolver.resolveForCurrentUser();
        scope.assertClassAccessible(classId);

        ClassItem clazz = classItemRepository.findById(classId)
                .orElseThrow(() -> new IllegalStateException("Classe introuvable."));

        List<Student> students = studentRepository.findByClassItemId(classId).stream()
                .sorted(Comparator.comparing(Student::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();

        return PortalClassDetailResponse.builder()
                .id(clazz.getId())
                .name(clazz.getName())
                .level(clazz.getLevel())
                .studentsCount(clazz.getStudentsCount())
                .canEdit(scope.canEdit())
                .students(students.stream()
                        .map(s -> PortalStudentRow.builder().id(s.getId()).name(s.getName()).build())
                        .toList())
                .build();
    }

    @Transactional(readOnly = true)
    public PortalRollCallResponse getRollCall(String classId, String date) {
        PortalScopeResolver.PortalScope scope = portalScopeResolver.resolveForCurrentUser();
        scope.assertClassAccessible(classId);

        ClassItem clazz = classItemRepository.findById(classId)
                .orElseThrow(() -> new IllegalStateException("Classe introuvable."));

        List<Student> students = studentRepository.findByClassItemId(classId).stream()
                .sorted(Comparator.comparing(Student::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();

        Map<String, AttendanceRecord> byStudent = attendanceRecordRepository
                .findByClassItemIdAndDate(classId, date).stream()
                .filter(r -> r.getStudent() != null)
                .collect(Collectors.toMap(r -> r.getStudent().getId(), r -> r, (a, b) -> a));

        return PortalRollCallResponse.builder()
                .classId(clazz.getId())
                .className(clazz.getName())
                .date(date)
                .canEdit(scope.canEdit())
                .students(students.stream()
                        .map(s -> {
                            AttendanceRecord rec = byStudent.get(s.getId());
                            return PortalRollCallRow.builder()
                                    .studentId(s.getId())
                                    .studentName(s.getName())
                                    .status(rec != null ? rec.getStatus() : AttendanceStatus.PRESENT)
                                    .recordId(rec != null ? rec.getId() : null)
                                    .build();
                        })
                        .toList())
                .build();
    }

    @Transactional
    public PortalRollCallResponse saveRollCall(RollCallRequest request) {
        PortalScopeResolver.PortalScope scope = portalScopeResolver.resolveForCurrentUser();
        scope.assertCanEdit();
        scope.assertClassAccessible(request.getClassId());

        ClassItem clazz = classItemRepository.findById(request.getClassId())
                .orElseThrow(() -> new IllegalStateException("Classe introuvable."));

        for (var entry : request.getEntries()) {
            scope.assertStudentAccessible(entry.getStudentId());

            List<AttendanceRecord> existing = attendanceRecordRepository
                    .findByStudentIdAndDateAndClassItemId(
                            entry.getStudentId(), request.getDate(), request.getClassId());

            if (!existing.isEmpty()) {
                AttendanceRecord record = existing.get(0);
                record.setStatus(entry.getStatus());
                attendanceRecordRepository.save(record);
            } else {
                Student student = studentRepository.findById(entry.getStudentId())
                        .orElseThrow(() -> new IllegalStateException("Élève introuvable."));
                AttendanceRecord record = AttendanceRecord.builder()
                        .date(request.getDate())
                        .classItem(clazz)
                        .student(student)
                        .status(entry.getStatus())
                        .build();
                attendanceRecordRepository.save(record);
            }
        }

        return getRollCall(request.getClassId(), request.getDate());
    }

    @Transactional(readOnly = true)
    public PortalHomeworkResponse getHomework(String classId) {
        PortalScopeResolver.PortalScope scope = portalScopeResolver.resolveForCurrentUser();
        scope.assertClassAccessible(classId);

        ClassItem clazz = classItemRepository.findById(classId)
                .orElseThrow(() -> new IllegalStateException("Classe introuvable."));

        List<PortalHomeworkDto> items = homeworkAssignmentRepository
                .findByClassItemIdOrderByDueDateAsc(classId).stream()
                .map(this::toHomeworkDto)
                .toList();

        return PortalHomeworkResponse.builder()
                .classId(clazz.getId())
                .className(clazz.getName())
                .canEdit(scope.canEdit())
                .items(items)
                .build();
    }

    @Transactional
    public PortalHomeworkDto createHomework(HomeworkRequest request) {
        PortalScopeResolver.PortalScope scope = portalScopeResolver.resolveForCurrentUser();
        scope.assertCanEdit();
        scope.assertClassAccessible(request.getClassId());

        ClassItem clazz = classItemRepository.findById(request.getClassId())
                .orElseThrow(() -> new IllegalStateException("Classe introuvable."));

        Teacher teacher = null;
        if (scope.role() == UserRole.TEACHER) {
            teacher = teacherRepository.findByAppUser_Id(scope.user().getId())
                    .or(() -> teacherRepository.findByEmailIgnoreCase(scope.user().getEmail()))
                    .orElse(null);
        }

        HomeworkAssignment assignment = HomeworkAssignment.builder()
                .classItem(clazz)
                .title(request.getTitle().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .dueDate(request.getDueDate())
                .createdBy(teacher)
                .createdAt(Instant.now())
                .build();

        return toHomeworkDto(homeworkAssignmentRepository.save(assignment));
    }

    @Transactional
    public void deleteHomework(String homeworkId) {
        PortalScopeResolver.PortalScope scope = portalScopeResolver.resolveForCurrentUser();
        scope.assertCanEdit();

        HomeworkAssignment assignment = homeworkAssignmentRepository.findById(homeworkId)
                .orElseThrow(() -> new IllegalStateException("Devoir introuvable."));

        if (assignment.getClassItem() == null) {
            throw new IllegalStateException("Devoir sans classe.");
        }
        scope.assertClassAccessible(assignment.getClassItem().getId());
        homeworkAssignmentRepository.delete(assignment);
    }

    @Transactional(readOnly = true)
    public PortalDirectoryResponse getDirectory() {
        PortalScopeResolver.PortalScope scope = portalScopeResolver.resolveForCurrentUser();

        if (scope.role() != UserRole.PARENT && scope.role() != UserRole.STUDENT) {
            throw new IllegalStateException("Annuaire réservé aux parents et élèves.");
        }

        List<PortalTeacherContactDto> contacts = new ArrayList<>();

        for (Student student : scope.students()) {
            ClassItem clazz = student.getClassItem();
            if (clazz == null) continue;
            Teacher teacher = clazz.getHomeroomTeacher();
            if (teacher == null) continue;

            contacts.add(PortalTeacherContactDto.builder()
                    .classId(clazz.getId())
                    .className(clazz.getName())
                    .studentName(student.getName())
                    .teacherId(teacher.getId())
                    .teacherName(teacher.getName())
                    .subject(teacher.getSubject())
                    .phone(teacher.getPhone())
                    .email(teacher.getEmail())
                    .build());
        }

        return PortalDirectoryResponse.builder().teachers(contacts).build();
    }

    private PortalHomeworkDto toHomeworkDto(HomeworkAssignment assignment) {
        return PortalHomeworkDto.builder()
                .id(assignment.getId())
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .dueDate(assignment.getDueDate())
                .createdAt(assignment.getCreatedAt() != null ? assignment.getCreatedAt().toString() : null)
                .build();
    }
}
