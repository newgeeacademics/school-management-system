package com.classroom.backend.model;

import com.classroom.backend.model.enums.BusTripStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "bus_trips")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BusTrip {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "route_id", nullable = false)
    private TransportRoute transportRoute;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BusTripStatus status;

    private Double currentLat;
    private Double currentLng;
    private Double heading;
    private Double speedKmh;

    private Instant lastPositionAt;
    private Instant startedAt;
    private Instant completedAt;
}
