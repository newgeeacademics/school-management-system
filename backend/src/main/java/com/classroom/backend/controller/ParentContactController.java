package com.classroom.backend.controller;

import com.classroom.backend.dto.request.ParentContactRequest;
import com.classroom.backend.model.ParentContact;
import com.classroom.backend.service.ParentContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parents")
@RequiredArgsConstructor
public class ParentContactController {

    private final ParentContactService parentContactService;

    @GetMapping
    public ResponseEntity<List<ParentContact>> findAll() {
        return ResponseEntity.ok(parentContactService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParentContact> findById(@PathVariable String id) {
        return ResponseEntity.ok(parentContactService.findById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ParentContact>> findByStudentId(@PathVariable String studentId) {
        return ResponseEntity.ok(parentContactService.findByStudentId(studentId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParentContact> create(@Valid @RequestBody ParentContactRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(parentContactService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParentContact> update(@PathVariable String id, @Valid @RequestBody ParentContactRequest request) {
        return ResponseEntity.ok(parentContactService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        parentContactService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
