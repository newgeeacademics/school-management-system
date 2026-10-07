package com.classroom.backend;

import com.classroom.backend.model.TransportRoute;
import com.classroom.backend.model.TransportRouteWaypoint;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class TransportRouteJsonTest {

    @Test
    void routeWithWaypointsSerializesWithoutNestingItself() throws Exception {
        TransportRoute route = TransportRoute.builder().id("r1").name("Ligne 1").driverName("K").departureTime("06:45").build();
        for (String name : new String[] {"Arrêt 1", "Arrêt 2", "École"}) {
            route.getWaypoints().add(TransportRouteWaypoint.builder()
                    .transportRoute(route).lat(5.3).lng(-4.0).name(name).build());
        }

        String json = new ObjectMapper().writeValueAsString(route);
        JsonNode node = new ObjectMapper().readTree(json);

        assertEquals(3, node.get("waypoints").size());
        assertEquals("École", node.get("waypoints").get(2).get("name").asText());
        assertFalse(node.get("waypoints").get(0).has("transportRoute"));
    }
}
