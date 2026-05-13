package com.classroom.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "matieres")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Matiere {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String name;
}
