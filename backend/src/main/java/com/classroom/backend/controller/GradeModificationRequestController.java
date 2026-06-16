package com.classroom.backend.controller;

import com.classroom.backend.dto.request.GradeModificationReviewRequest;
import com.classroom.backend.dto.request.GradeModificationSubmitRequest;
import com.classroom.backend.dto.response.GradeModificationRequestResponse;
import com.classroom.backend.service.GradeModificationRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grades/modification-requests")
@RequiredArgsConstructor
public class GradeModificationRequestController {

    private final GradeModificationRequestService modificationRequestService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<GradeModificationRequestResponse>> list(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(modificationRequestService.listForCurrentUser(status));
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<GradeModificationRequestResponse> submit(
            @Valid @RequestBody GradeModificationSubmitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(modificationRequestService.submit(request));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GradeModificationRequestResponse> approve(
            @PathVariable String id,
            @RequestBody(required = false) GradeModificationReviewRequest review) {
        return ResponseEntity.ok(modificationRequestService.approve(id, review));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GradeModificationRequestResponse> reject(
            @PathVariable String id,
            @RequestBody(required = false) GradeModificationReviewRequest review) {
        return ResponseEntity.ok(modificationRequestService.reject(id, review));
    }
}
