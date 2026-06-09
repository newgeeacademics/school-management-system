package com.classroom.backend.repository;

import com.classroom.backend.model.PayrollPayment;
import com.classroom.backend.model.enums.PayrollEmployeeType;
import com.classroom.backend.model.enums.PayrollStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayrollPaymentRepository extends JpaRepository<PayrollPayment, String> {

    List<PayrollPayment> findByEmployeeType(PayrollEmployeeType employeeType);

    List<PayrollPayment> findByEmployeeTypeAndStatus(PayrollEmployeeType employeeType, PayrollStatus status);

    List<PayrollPayment> findByStatus(PayrollStatus status);
}
