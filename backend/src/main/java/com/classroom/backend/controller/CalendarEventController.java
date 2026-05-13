package com.classroom.backend.controller;

import com.classroom.backend.dto.request.CalendarEventRequest;
import com.classroom.backend.model.CalendarEvent;
import com.classroom.backend.service.CalendarEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarEventController {

    private final CalendarEventService calendarEventService;

    @GetMapping
    public ResponseEntity<List<CalendarEvent>> findAll() {
        return ResponseEntity.ok(calendarEventService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CalendarEvent> findById(@PathVariable String id) {
        return ResponseEntity.ok(calendarEventService.findById(id));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<CalendarEvent>> findByDate(@PathVariable String date) {
        return ResponseEntity.ok(calendarEventService.findByDate(date));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CalendarEvent> create(@Valid @RequestBody CalendarEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(calendarEventService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CalendarEvent> update(@PathVariable String id, @Valid @RequestBody CalendarEventRequest request) {
        return ResponseEntity.ok(calendarEventService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        calendarEventService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
