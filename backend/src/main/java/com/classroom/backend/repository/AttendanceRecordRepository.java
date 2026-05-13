package com.classroom.backend.repository;

import com.classroom.backend.model.AttendanceRecord;
import com.classroom.backend.model.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, String> {
    List<AttendanceRecord> findByStudentId(String studentId);
    List<AttendanceRecord> findByClassItemId(String classId);
    List<AttendanceRecord> findByDate(String date);
    List<AttendanceRecord> findByStudentIdAndStatus(String studentId, AttendanceStatus status);
    long countByStudentId(String studentId);
    long countByStudentIdAndStatus(String studentId, AttendanceStatus status);
}
