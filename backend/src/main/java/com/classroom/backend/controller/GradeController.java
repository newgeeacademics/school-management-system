package com.classroom.backend.controller;

import com.classroom.backend.dto.request.EvaluationRequest;
import com.classroom.backend.dto.request.StudentGradeRequest;
import com.classroom.backend.dto.response.GradeAverageResponse;
import com.classroom.backend.model.Evaluation;
import com.classroom.backend.model.StudentGrade;
import com.classroom.backend.service.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    // --- Evaluations ---

    @GetMapping("/evaluations")
    public ResponseEntity<List<Evaluation>> findAllEvaluations() {
        return ResponseEntity.ok(gradeService.findAllEvaluations());
    }

    @GetMapping("/evaluations/{id}")
    public ResponseEntity<Evaluation> findEvaluationById(@PathVariable String id) {
        return ResponseEntity.ok(gradeService.findEvaluationById(id));
    }

    @GetMapping("/evaluations/class/{classId}")
    public ResponseEntity<List<Evaluation>> findEvaluationsByClassId(@PathVariable String classId) {
        return ResponseEntity.ok(gradeService.findEvaluationsByClassId(classId));
    }

    @PostMapping("/evaluations")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Evaluation> createEvaluation(@Valid @RequestBody EvaluationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gradeService.createEvaluation(request));
    }

    @DeleteMapping("/evaluations/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Void> deleteEvaluation(@PathVariable String id) {
        gradeService.deleteEvaluation(id);
        return ResponseEntity.noContent().build();
    }

    // --- Student Grades ---

    @GetMapping
    public ResponseEntity<List<StudentGrade>> findAllGrades() {
        return ResponseEntity.ok(gradeService.findAllGrades());
    }

    @GetMapping("/evaluation/{evaluationId}")
    public ResponseEntity<List<StudentGrade>> findGradesByEvaluationId(@PathVariable String evaluationId) {
        return ResponseEntity.ok(gradeService.findGradesByEvaluationId(evaluationId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<StudentGrade>> findGradesByStudentId(@PathVariable String studentId) {
        return ResponseEntity.ok(gradeService.findGradesByStudentId(studentId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<StudentGrade> createOrUpdateGrade(@Valid @RequestBody StudentGradeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gradeService.createOrUpdateGrade(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Void> deleteGrade(@PathVariable String id) {
        gradeService.deleteGrade(id);
        return ResponseEntity.noContent().build();
    }

    // --- Averages ---

    @GetMapping("/averages/class/{classId}")
    public ResponseEntity<List<GradeAverageResponse>> computeClassAverages(@PathVariable String classId) {
        return ResponseEntity.ok(gradeService.computeClassAverages(classId));
    }
}
