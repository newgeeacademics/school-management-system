package com.classroom.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "transport_routes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TransportRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String driverName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "appUser"})
    private Driver driver;

    @Column(nullable = false)
    private String departureTime;

    private String returnTime;
    private String note;

    @OneToMany(mappedBy = "transportRoute", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderColumn(name = "waypoint_order")
    @Builder.Default
    private List<TransportRouteWaypoint> waypoints = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String routePolylineJson;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "transport_route_students",
        joinColumns = @JoinColumn(name = "route_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    @Builder.Default
    private List<Student> students = new ArrayList<>();
}
