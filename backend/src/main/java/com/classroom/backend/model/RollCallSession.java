package com.classroom.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "roll_call_sessions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"class_id", "session_date"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RollCallSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassItem classItem;

    @Column(name = "session_date", nullable = false)
    private String date;

    private Instant finalizedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finalized_by_teacher_id")
    private Teacher finalizedBy;
}
