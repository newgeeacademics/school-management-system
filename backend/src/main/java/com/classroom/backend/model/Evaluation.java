package com.classroom.backend.model;

import com.classroom.backend.model.enums.EvaluationPeriod;
import com.classroom.backend.model.enums.EvaluationType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "evaluations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassItem classItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private String date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvaluationPeriod period;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvaluationType type;

    @Column(nullable = false)
    private Double coefficient;

    @Column(nullable = false)
    private Double maxScore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher createdByTeacher;

    private String documentStoredName;
    private String documentOriginalName;
    private String documentContentType;
}
