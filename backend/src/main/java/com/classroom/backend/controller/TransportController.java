package com.classroom.backend.controller;

import com.classroom.backend.dto.request.TransportRouteRequest;
import com.classroom.backend.model.TransportRoute;
import com.classroom.backend.service.TransportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transport")
@RequiredArgsConstructor
public class TransportController {

    private final TransportService transportService;

    @GetMapping
    public ResponseEntity<List<TransportRoute>> findAll() {
        return ResponseEntity.ok(transportService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransportRoute> findById(@PathVariable String id) {
        return ResponseEntity.ok(transportService.findById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<TransportRoute>> findByStudentId(@PathVariable String studentId) {
        return ResponseEntity.ok(transportService.findByStudentId(studentId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransportRoute> create(@Valid @RequestBody TransportRouteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transportService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransportRoute> update(@PathVariable String id, @Valid @RequestBody TransportRouteRequest request) {
        return ResponseEntity.ok(transportService.update(id, request));
    }

    @PatchMapping("/{id}/students")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransportRoute> updateStudents(@PathVariable String id, @RequestBody List<String> studentIds) {
        return ResponseEntity.ok(transportService.updateStudents(id, studentIds));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        transportService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
