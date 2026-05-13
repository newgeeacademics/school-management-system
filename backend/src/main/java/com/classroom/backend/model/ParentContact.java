package com.classroom.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parent_contacts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ParentContact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    private String phone;
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;
}
