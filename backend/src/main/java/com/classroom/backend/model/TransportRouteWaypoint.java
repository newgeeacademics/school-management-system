package com.classroom.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transport_route_waypoints")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TransportRouteWaypoint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /** Back-reference only: serializing it would nest the route inside itself forever. */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private TransportRoute transportRoute;

    @Column(nullable = false)
    private Double lat;

    @Column(nullable = false)
    private Double lng;

    @Column(nullable = false)
    private String name;
}
