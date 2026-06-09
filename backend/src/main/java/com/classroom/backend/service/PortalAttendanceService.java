package com.classroom.backend.service;

import com.classroom.backend.dto.response.AttendanceStatsResponse;
import com.classroom.backend.dto.response.PortalAttendanceResponse;
import com.classroom.backend.dto.response.PortalAttendanceResponse.PortalAttendanceRecordDto;
import com.classroom.backend.dto.response.PortalAttendanceResponse.PortalStudentOption;
import com.classroom.backend.model.AttendanceRecord;
import com.classroom.backend.model.Student;
import com.classroom.backend.model.enums.AttendanceStatus;
import com.classroom.backend.repository.AttendanceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortalAttendanceService {

    private final PortalScopeResolver portalScopeResolver;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceService attendanceService;

    @Transactional(readOnly = true)
    public PortalAttendanceResponse getAttendance(String studentId, AttendanceStatus statusFilter) {
        PortalScopeResolver.PortalScope scope = portalScopeResolver.resolveForCurrentUser();
        List<Student> students = scope.students();

        if (students.isEmpty()) {
            return PortalAttendanceResponse.builder()
                    .students(List.of())
                    .stats(null)
                    .records(List.of())
                    .build();
        }

        Map<String, String> classNames = scope.classes().stream()
                .collect(Collectors.toMap(c -> c.getId(), c -> c.getName(), (a, b) -> a));

        Student selected = resolveSelectedStudent(students, studentId);
        scope.assertStudentAccessible(selected.getId());

        List<PortalStudentOption> options = students.stream()
                .map(s -> PortalStudentOption.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .className(s.getClassItem() != null ? s.getClassItem().getName() : null)
                        .build())
                .toList();

        List<AttendanceRecord> records = attendanceRecordRepository.findByStudentId(selected.getId()).stream()
                .filter(r -> statusFilter == null || r.getStatus() == statusFilter)
                .sorted(Comparator.comparing(AttendanceRecord::getDate).reversed())
                .toList();

        AttendanceStatsResponse stats = attendanceService.getStudentStats(selected.getId());

        return PortalAttendanceResponse.builder()
                .studentId(selected.getId())
                .studentName(selected.getName())
                .students(options)
                .stats(stats)
                .records(records.stream().map(r -> toDto(r, classNames)).toList())
                .build();
    }

    private Student resolveSelectedStudent(List<Student> students, String studentId) {
        if (studentId != null && !studentId.isBlank()) {
            return students.stream()
                    .filter(s -> s.getId().equals(studentId))
                    .findFirst()
                    .orElse(students.get(0));
        }
        return students.get(0);
    }

    private PortalAttendanceRecordDto toDto(AttendanceRecord record, Map<String, String> classNames) {
        String className = null;
        if (record.getClassItem() != null) {
            className = classNames.getOrDefault(record.getClassItem().getId(), record.getClassItem().getName());
        }
        return PortalAttendanceRecordDto.builder()
                .id(record.getId())
                .date(record.getDate())
                .status(record.getStatus())
                .className(className)
                .studentName(record.getStudent() != null ? record.getStudent().getName() : null)
                .build();
    }
}
