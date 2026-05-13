package com.classroom.backend.controller;

import com.classroom.backend.dto.request.ClassItemRequest;
import com.classroom.backend.model.ClassItem;
import com.classroom.backend.service.ClassService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    @GetMapping
    public ResponseEntity<List<ClassItem>> findAll() {
        return ResponseEntity.ok(classService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassItem> findById(@PathVariable String id) {
        return ResponseEntity.ok(classService.findById(id));
    }

    @GetMapping("/level/{level}")
    public ResponseEntity<List<ClassItem>> findByLevel(@PathVariable String level) {
        return ResponseEntity.ok(classService.findByLevel(level));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassItem> create(@Valid @RequestBody ClassItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(classService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassItem> update(@PathVariable String id, @Valid @RequestBody ClassItemRequest request) {
        return ResponseEntity.ok(classService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        classService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
