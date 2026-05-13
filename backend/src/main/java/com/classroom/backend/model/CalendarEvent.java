package com.classroom.backend.model;

import com.classroom.backend.model.enums.EventType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "calendar_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CalendarEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private String date;

    private String time;
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType type;
}
