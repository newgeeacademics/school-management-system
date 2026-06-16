package com.classroom.backend.controller;

import com.classroom.backend.dto.request.TeacherRequest;
import com.classroom.backend.dto.response.TeacherIdCardResponse;
import com.classroom.backend.model.Teacher;
import com.classroom.backend.service.TeacherIdCardService;
import com.classroom.backend.service.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;
    private final TeacherIdCardService teacherIdCardService;

    @GetMapping
    public ResponseEntity<List<Teacher>> findAll() {
        return ResponseEntity.ok(teacherService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Teacher> findById(@PathVariable String id) {
        return ResponseEntity.ok(teacherService.findById(id));
    }

    @GetMapping("/{id}/id-card")
    public ResponseEntity<TeacherIdCardResponse> idCard(@PathVariable String id) {
        return ResponseEntity.ok(teacherIdCardService.getIdCard(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Teacher> create(@Valid @RequestBody TeacherRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teacherService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Teacher> update(@PathVariable String id, @Valid @RequestBody TeacherRequest request) {
        return ResponseEntity.ok(teacherService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        teacherService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
