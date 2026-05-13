package com.classroom.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payment_receipts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String parentName;

    private String studentName;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false, unique = true)
    private String reference;
}
