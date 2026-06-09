package com.classroom.backend.controller;

import com.classroom.backend.dto.request.StudentRequest;
import com.classroom.backend.dto.response.StudentIdCardResponse;
import com.classroom.backend.model.Student;
import com.classroom.backend.service.StudentIdCardService;
import com.classroom.backend.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final StudentIdCardService studentIdCardService;

    @GetMapping
    public ResponseEntity<List<Student>> findAll() {
        return ResponseEntity.ok(studentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> findById(@PathVariable String id) {
        return ResponseEntity.ok(studentService.findById(id));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Student>> findByClassId(@PathVariable String classId) {
        return ResponseEntity.ok(studentService.findByClassId(classId));
    }

    @GetMapping("/{id}/id-card")
    public ResponseEntity<StudentIdCardResponse> idCard(@PathVariable String id) {
        return ResponseEntity.ok(studentIdCardService.getIdCard(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Student> create(@Valid @RequestBody StudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Student> update(@PathVariable String id, @Valid @RequestBody StudentRequest request) {
        return ResponseEntity.ok(studentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
