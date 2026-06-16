package com.classroom.backend.controller;

import com.classroom.backend.dto.request.SchoolRequest;
import com.classroom.backend.model.School;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.service.SchoolEmailService;
import com.classroom.backend.service.SchoolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schools")
@RequiredArgsConstructor
public class SchoolController {

    private final SchoolService schoolService;
    private final SchoolEmailService schoolEmailService;

    @GetMapping
    public ResponseEntity<List<School>> findAll() {
        return ResponseEntity.ok(schoolService.findAll());
    }

    @GetMapping("/login-email-preview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> loginEmailPreview(
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam UserRole role) {
        return ResponseEntity.ok(Map.of(
                "email", schoolEmailService.previewLoginEmail(firstName, lastName, role)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<School> findById(@PathVariable String id) {
        return ResponseEntity.ok(schoolService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<School> create(@Valid @RequestBody SchoolRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(schoolService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<School> update(@PathVariable String id, @Valid @RequestBody SchoolRequest request) {
        return ResponseEntity.ok(schoolService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        schoolService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
