package com.classroom.backend.controller;

import com.classroom.backend.dto.request.PaymentReceiptRequest;
import com.classroom.backend.dto.request.PaymentReminderRequest;
import com.classroom.backend.model.PaymentReceipt;
import com.classroom.backend.model.PaymentReminder;
import com.classroom.backend.model.enums.PaymentStatus;
import com.classroom.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // --- Reminders ---

    @GetMapping("/reminders")
    public ResponseEntity<List<PaymentReminder>> findAllReminders() {
        return ResponseEntity.ok(paymentService.findAllReminders());
    }

    @GetMapping("/reminders/{id}")
    public ResponseEntity<PaymentReminder> findReminderById(@PathVariable String id) {
        return ResponseEntity.ok(paymentService.findReminderById(id));
    }

    @PostMapping("/reminders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentReminder> createReminder(@Valid @RequestBody PaymentReminderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createReminder(request));
    }

    @PatchMapping("/reminders/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentReminder> updateReminderStatus(
            @PathVariable String id,
            @RequestParam PaymentStatus status) {
        return ResponseEntity.ok(paymentService.updateReminderStatus(id, status));
    }

    @DeleteMapping("/reminders/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReminder(@PathVariable String id) {
        paymentService.deleteReminder(id);
        return ResponseEntity.noContent().build();
    }

    // --- Receipts ---

    @GetMapping("/receipts")
    public ResponseEntity<List<PaymentReceipt>> findAllReceipts() {
        return ResponseEntity.ok(paymentService.findAllReceipts());
    }

    @GetMapping("/receipts/{id}")
    public ResponseEntity<PaymentReceipt> findReceiptById(@PathVariable String id) {
        return ResponseEntity.ok(paymentService.findReceiptById(id));
    }

    @PostMapping("/receipts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentReceipt> createReceipt(@Valid @RequestBody PaymentReceiptRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createReceipt(request));
    }

    @DeleteMapping("/receipts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReceipt(@PathVariable String id) {
        paymentService.deleteReceipt(id);
        return ResponseEntity.noContent().build();
    }
}
