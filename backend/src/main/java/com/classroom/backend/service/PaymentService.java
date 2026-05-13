package com.classroom.backend.service;

import com.classroom.backend.dto.request.PaymentReceiptRequest;
import com.classroom.backend.dto.request.PaymentReminderRequest;
import com.classroom.backend.model.PaymentReceipt;
import com.classroom.backend.model.PaymentReminder;
import com.classroom.backend.model.enums.PaymentStatus;
import com.classroom.backend.repository.PaymentReceiptRepository;
import com.classroom.backend.repository.PaymentReminderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentReminderRepository reminderRepository;
    private final PaymentReceiptRepository receiptRepository;

    // --- Reminders ---

    public List<PaymentReminder> findAllReminders() {
        return reminderRepository.findAll();
    }

    public PaymentReminder findReminderById(String id) {
        return reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment reminder not found: " + id));
    }

    @Transactional
    public PaymentReminder createReminder(PaymentReminderRequest request) {
        PaymentReminder reminder = PaymentReminder.builder()
                .parentName(request.getParentName())
                .studentName(request.getStudentName())
                .amount(request.getAmount())
                .dueDate(request.getDueDate())
                .status(PaymentStatus.ENVOYE)
                .build();
        return reminderRepository.save(reminder);
    }

    @Transactional
    public PaymentReminder updateReminderStatus(String id, PaymentStatus status) {
        PaymentReminder reminder = findReminderById(id);
        reminder.setStatus(status);
        return reminderRepository.save(reminder);
    }

    @Transactional
    public void deleteReminder(String id) {
        reminderRepository.deleteById(id);
    }

    // --- Receipts ---

    public List<PaymentReceipt> findAllReceipts() {
        return receiptRepository.findAll();
    }

    public PaymentReceipt findReceiptById(String id) {
        return receiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment receipt not found: " + id));
    }

    @Transactional
    public PaymentReceipt createReceipt(PaymentReceiptRequest request) {
        String reference = request.getReference();
        if (reference == null || reference.isBlank()) {
            reference = "REC-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                    + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }

        PaymentReceipt receipt = PaymentReceipt.builder()
                .parentName(request.getParentName())
                .studentName(request.getStudentName())
                .amount(request.getAmount())
                .date(request.getDate())
                .reference(reference)
                .build();

        return receiptRepository.save(receipt);
    }

    @Transactional
    public void deleteReceipt(String id) {
        receiptRepository.deleteById(id);
    }
}
