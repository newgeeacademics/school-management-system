package com.classroom.backend.controller;

import com.classroom.backend.dto.request.AttendanceRecordRequest;
import com.classroom.backend.dto.response.AttendanceStatsResponse;
import com.classroom.backend.model.AttendanceRecord;
import com.classroom.backend.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<List<AttendanceRecord>> findAll() {
        return ResponseEntity.ok(attendanceService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceRecord> findById(@PathVariable String id) {
        return ResponseEntity.ok(attendanceService.findById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceRecord>> findByStudentId(@PathVariable String studentId) {
        return ResponseEntity.ok(attendanceService.findByStudentId(studentId));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<AttendanceRecord>> findByClassId(@PathVariable String classId) {
        return ResponseEntity.ok(attendanceService.findByClassId(classId));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<AttendanceRecord>> findByDate(@PathVariable String date) {
        return ResponseEntity.ok(attendanceService.findByDate(date));
    }

    @GetMapping("/stats/{studentId}")
    public ResponseEntity<AttendanceStatsResponse> getStudentStats(@PathVariable String studentId) {
        return ResponseEntity.ok(attendanceService.getStudentStats(studentId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<AttendanceRecord> create(@Valid @RequestBody AttendanceRecordRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<AttendanceRecord> update(@PathVariable String id, @Valid @RequestBody AttendanceRecordRequest request) {
        return ResponseEntity.ok(attendanceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        attendanceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
