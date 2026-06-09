package com.classroom.backend.controller;

import com.classroom.backend.dto.request.PayrollPaymentRequest;
import com.classroom.backend.dto.response.FinanceOverviewResponse;
import com.classroom.backend.model.PayrollPayment;
import com.classroom.backend.model.enums.PayrollEmployeeType;
import com.classroom.backend.service.FinanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;

    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STAFF')")
    public ResponseEntity<FinanceOverviewResponse> overview() {
        return ResponseEntity.ok(financeService.getOverview());
    }

    @GetMapping("/payroll")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STAFF')")
    public ResponseEntity<List<PayrollPayment>> listPayroll(
            @RequestParam(required = false) PayrollEmployeeType type
    ) {
        return ResponseEntity.ok(financeService.findPayroll(type));
    }

    @PostMapping("/payroll")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<PayrollPayment> createPayroll(@Valid @RequestBody PayrollPaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(financeService.createPayroll(request));
    }

    @PutMapping("/payroll/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<PayrollPayment> updatePayroll(
            @PathVariable String id,
            @Valid @RequestBody PayrollPaymentRequest request
    ) {
        return ResponseEntity.ok(financeService.updatePayroll(id, request));
    }

    @PostMapping("/payroll/{id}/mark-paid")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<PayrollPayment> markPaid(@PathVariable String id) {
        return ResponseEntity.ok(financeService.markPaid(id));
    }

    @DeleteMapping("/payroll/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Void> deletePayroll(@PathVariable String id) {
        financeService.deletePayroll(id);
        return ResponseEntity.noContent().build();
    }
}
