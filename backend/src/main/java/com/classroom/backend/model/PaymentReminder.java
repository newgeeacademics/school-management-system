package com.classroom.backend.model;

import com.classroom.backend.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payment_reminders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentReminder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String parentName;

    private String studentName;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;
}
