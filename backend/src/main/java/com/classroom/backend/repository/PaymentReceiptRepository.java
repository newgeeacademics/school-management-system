package com.classroom.backend.repository;

import com.classroom.backend.model.PaymentReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentReceiptRepository extends JpaRepository<PaymentReceipt, String> {
    List<PaymentReceipt> findByParentName(String parentName);
}
