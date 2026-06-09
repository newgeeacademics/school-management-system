package com.classroom.backend.controller;

import com.classroom.backend.dto.request.FeeInstallmentRequest;
import com.classroom.backend.model.FeeInstallment;
import com.classroom.backend.model.enums.FeeCategory;
import com.classroom.backend.service.FeeInstallmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
@RequiredArgsConstructor
public class FeeInstallmentController {

    private final FeeInstallmentService feeInstallmentService;

    @GetMapping
    public ResponseEntity<List<FeeInstallment>> findAll(
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) FeeCategory category
    ) {
        if (academicYear != null && category != null) {
            return ResponseEntity.ok(feeInstallmentService.findByCategoryAndYear(category, academicYear));
        }
        if (academicYear != null) {
            return ResponseEntity.ok(feeInstallmentService.findByYear(academicYear));
        }
        return ResponseEntity.ok(feeInstallmentService.findAll());
    }

    @PostMapping
    public ResponseEntity<FeeInstallment> create(@Valid @RequestBody FeeInstallmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feeInstallmentService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeeInstallment> update(
            @PathVariable String id,
            @Valid @RequestBody FeeInstallmentRequest request
    ) {
        return ResponseEntity.ok(feeInstallmentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        feeInstallmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
