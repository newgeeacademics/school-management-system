package com.classroom.backend.controller;

import com.classroom.backend.dto.request.EvaluationRequest;
import com.classroom.backend.dto.request.StudentGradeRequest;
import com.classroom.backend.dto.response.PortalFeedResponse;
import com.classroom.backend.dto.response.PortalGradesDetailResponse;
import com.classroom.backend.dto.response.PortalGradesDetailResponse.PortalEvaluationDto;
import com.classroom.backend.dto.response.PortalGradesDetailResponse.PortalGradeEntryDto;
import com.classroom.backend.service.PortalGradeService;
import com.classroom.backend.service.PortalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portal")
@RequiredArgsConstructor
public class PortalController {

    private final PortalService portalService;
    private final PortalGradeService portalGradeService;

    /** Role-scoped feed: teacher → their classes/students; student → their class; parent → children. */
    @GetMapping("/feed")
    public ResponseEntity<PortalFeedResponse> feed() {
        return ResponseEntity.ok(portalService.getFeedForCurrentUser());
    }

    /** Grades & bulletin scoped to the signed-in teacher, student, or parent. */
    @GetMapping("/grades")
    public ResponseEntity<PortalGradesDetailResponse> gradesDetail(
            @RequestParam(required = false) String classId,
            @RequestParam(required = false, defaultValue = "Trimestre 1") String period,
            @RequestParam(required = false) String studentId
    ) {
        return ResponseEntity.ok(portalGradeService.getGradesDetail(classId, period, studentId));
    }

    /** Teacher only — create an evaluation for one of their classes. */
    @PostMapping("/grades/evaluations")
    public ResponseEntity<PortalEvaluationDto> createEvaluation(@Valid @RequestBody EvaluationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(portalGradeService.createEvaluation(request));
    }

    /** Teacher only — enter or update a student mark. */
    @PostMapping("/grades")
    public ResponseEntity<PortalGradeEntryDto> saveGrade(@Valid @RequestBody StudentGradeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(portalGradeService.saveGrade(request));
    }
}
