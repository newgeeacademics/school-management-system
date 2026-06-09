package com.classroom.backend.controller;

import com.classroom.backend.dto.request.AnnouncementRequest;
import com.classroom.backend.model.Announcement;
import com.classroom.backend.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<List<Announcement>> findAll() {
        return ResponseEntity.ok(announcementService.findAll());
    }

    @PostMapping
    public ResponseEntity<Announcement> create(@Valid @RequestBody AnnouncementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(announcementService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Announcement> update(
            @PathVariable String id,
            @Valid @RequestBody AnnouncementRequest request
    ) {
        return ResponseEntity.ok(announcementService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        announcementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
