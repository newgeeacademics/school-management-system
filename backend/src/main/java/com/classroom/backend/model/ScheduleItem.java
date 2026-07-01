package com.classroom.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "schedule_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ScheduleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassItem classItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @Column(name = "schedule_day", nullable = false)
    private String day;

    @Column(nullable = false)
    private String time;

    private String room;
}
