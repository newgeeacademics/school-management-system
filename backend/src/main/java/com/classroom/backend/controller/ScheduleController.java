package com.classroom.backend.controller;

import com.classroom.backend.dto.request.ScheduleItemRequest;
import com.classroom.backend.model.ScheduleItem;
import com.classroom.backend.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<List<ScheduleItem>> findAll() {
        return ResponseEntity.ok(scheduleService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScheduleItem> findById(@PathVariable String id) {
        return ResponseEntity.ok(scheduleService.findById(id));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<ScheduleItem>> findByClassId(@PathVariable String classId) {
        return ResponseEntity.ok(scheduleService.findByClassId(classId));
    }

    @GetMapping("/day/{day}")
    public ResponseEntity<List<ScheduleItem>> findByDay(@PathVariable String day) {
        return ResponseEntity.ok(scheduleService.findByDay(day));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ScheduleItem> create(@Valid @RequestBody ScheduleItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ScheduleItem> update(@PathVariable String id, @Valid @RequestBody ScheduleItemRequest request) {
        return ResponseEntity.ok(scheduleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        scheduleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
