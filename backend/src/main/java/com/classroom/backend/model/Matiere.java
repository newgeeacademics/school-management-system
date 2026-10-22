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

    /** Unique per school (checked in MatiereService), not across the platform. */
    @Column(nullable = false)
    private String name;

    /** Owning establishment; null for subjects created before per-school scoping (shared). */
    @Column(name = "school_id")
    private String schoolId;
}
