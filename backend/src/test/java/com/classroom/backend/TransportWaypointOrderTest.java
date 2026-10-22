package com.classroom.backend;

import com.classroom.backend.model.TransportRoute;
import com.classroom.backend.model.TransportRouteWaypoint;
import com.classroom.backend.repository.TransportRouteRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@Transactional
class TransportWaypointOrderTest {

    @Autowired private TransportRouteRepository routes;
    @Autowired private EntityManager em;

    @Test
    void stopsComeBackInTheOrderTheyWereSaved() {
        TransportRoute route = TransportRoute.builder().name("Ligne 1").driverName("K").departureTime("06:45").build();
        for (String name : List.of("Arrêt 1", "Arrêt 2", "Arrêt 3", "École · Test")) {
            route.getWaypoints().add(TransportRouteWaypoint.builder().transportRoute(route).lat(5.3).lng(-4.0).name(name).build());
        }
        String id = routes.saveAndFlush(route).getId();
        em.clear();

        List<String> names = routes.findById(id).orElseThrow().getWaypoints().stream().map(TransportRouteWaypoint::getName).toList();
        assertEquals(List.of("Arrêt 1", "Arrêt 2", "Arrêt 3", "École · Test"), names);
    }
}
