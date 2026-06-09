package com.classroom.backend.model;

import com.classroom.backend.model.enums.FeeCategory;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fee_installments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeInstallment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeeCategory category;

    @Column(nullable = false)
    private String academicYear;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String periodStart;

    @Column(nullable = false)
    private String periodEnd;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Integer sortOrder;
}
