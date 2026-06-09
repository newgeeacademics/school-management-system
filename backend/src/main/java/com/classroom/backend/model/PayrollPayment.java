package com.classroom.backend.model;

import com.classroom.backend.model.enums.PayrollEmployeeType;
import com.classroom.backend.model.enums.PayrollStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payroll_payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PayrollEmployeeType employeeType;

    /** Optional link to Teacher.id when employeeType is TEACHER */
    private String employeeId;

    @Column(nullable = false)
    private String employeeName;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String periodLabel;

    @Column(nullable = false)
    private String paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PayrollStatus status;

    @Column(length = 500)
    private String notes;
}
