package com.classroom.backend.service;

import com.classroom.backend.dto.request.AttendanceRecordRequest;
import com.classroom.backend.dto.response.AttendanceStatsResponse;
import com.classroom.backend.model.AttendanceRecord;
import com.classroom.backend.model.ClassItem;
import com.classroom.backend.model.Student;
import com.classroom.backend.model.enums.AttendanceStatus;
import com.classroom.backend.repository.AttendanceRecordRepository;
import com.classroom.backend.repository.ClassItemRepository;
import com.classroom.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final StudentRepository studentRepository;
    private final ClassItemRepository classItemRepository;

    public List<AttendanceRecord> findAll() {
        return attendanceRecordRepository.findAll();
    }

    public AttendanceRecord findById(String id) {
        return attendanceRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance record not found: " + id));
    }

    public List<AttendanceRecord> findByStudentId(String studentId) {
        return attendanceRecordRepository.findByStudentId(studentId);
    }

    public List<AttendanceRecord> findByClassId(String classId) {
        return attendanceRecordRepository.findByClassItemId(classId);
    }

    public List<AttendanceRecord> findByDate(String date) {
        return attendanceRecordRepository.findByDate(date);
    }

    @Transactional
    public AttendanceRecord create(AttendanceRecordRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found: " + request.getStudentId()));

        ClassItem classItem = null;
        if (request.getClassId() != null && !request.getClassId().isBlank()) {
            classItem = classItemRepository.findById(request.getClassId()).orElse(null);
        }

        AttendanceRecord record = AttendanceRecord.builder()
                .date(request.getDate())
                .classItem(classItem)
                .student(student)
                .status(request.getStatus())
                .build();

        return attendanceRecordRepository.save(record);
    }

    @Transactional
    public AttendanceRecord update(String id, AttendanceRecordRequest request) {
        AttendanceRecord record = findById(id);
        record.setDate(request.getDate());
        record.setStatus(request.getStatus());

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        record.setStudent(student);

        if (request.getClassId() != null && !request.getClassId().isBlank()) {
            ClassItem classItem = classItemRepository.findById(request.getClassId()).orElse(null);
            record.setClassItem(classItem);
        }

        return attendanceRecordRepository.save(record);
    }

    @Transactional
    public void delete(String id) {
        attendanceRecordRepository.deleteById(id);
    }

    public AttendanceStatsResponse getStudentStats(String studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        long total = attendanceRecordRepository.countByStudentId(studentId);
        long present = attendanceRecordRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.PRESENT);
        long absent = attendanceRecordRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.ABSENT);
        long late = attendanceRecordRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.RETARD);

        double rate = total > 0 ? (double) present / total * 100.0 : 0.0;

        return AttendanceStatsResponse.builder()
                .studentId(studentId)
                .studentName(student.getName())
                .totalRecords(total)
                .presentCount(present)
                .absentCount(absent)
                .lateCount(late)
                .attendanceRate(Math.round(rate * 100.0) / 100.0)
                .build();
    }
}
