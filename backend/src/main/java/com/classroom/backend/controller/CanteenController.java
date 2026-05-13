package com.classroom.backend.controller;

import com.classroom.backend.dto.request.CanteenMenuItemRequest;
import com.classroom.backend.model.CanteenMenuItem;
import com.classroom.backend.service.CanteenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/canteen")
@RequiredArgsConstructor
public class CanteenController {

    private final CanteenService canteenService;

    @GetMapping
    public ResponseEntity<List<CanteenMenuItem>> findAll() {
        return ResponseEntity.ok(canteenService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CanteenMenuItem> findById(@PathVariable String id) {
        return ResponseEntity.ok(canteenService.findById(id));
    }

    @GetMapping("/day/{day}")
    public ResponseEntity<List<CanteenMenuItem>> findByDay(@PathVariable String day) {
        return ResponseEntity.ok(canteenService.findByDay(day));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CanteenMenuItem> create(@Valid @RequestBody CanteenMenuItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(canteenService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CanteenMenuItem> update(@PathVariable String id, @Valid @RequestBody CanteenMenuItemRequest request) {
        return ResponseEntity.ok(canteenService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        canteenService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
