package com.classroom.backend.repository;

import com.classroom.backend.model.PaymentReminder;
import com.classroom.backend.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentReminderRepository extends JpaRepository<PaymentReminder, String> {
    List<PaymentReminder> findByStatus(PaymentStatus status);
    List<PaymentReminder> findByParentName(String parentName);
}
