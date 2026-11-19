package com.classroom.backend;

import com.classroom.backend.TransportTestSupport.School;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.AppUserRepository;
import com.classroom.backend.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static com.classroom.backend.TransportTestSupport.containsId;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** A driver starts, moves and stops only the bus of the routes assigned to them. */
@SpringBootTest
@AutoConfigureMockMvc
class DriverTripControlTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private AppUserRepository appUserRepository;
    @Autowired private JwtTokenProvider jwtTokenProvider;

    private TransportTestSupport api;
    private School school;
    private String assignedDriverToken;
    private String otherDriverToken;
    private String route;
    private String otherRoute;

    @BeforeEach
    void setUp() throws Exception {
        api = new TransportTestSupport(mockMvc, objectMapper, appUserRepository, jwtTokenProvider);
        school = api.registerSchool("Collège Bus");
        JsonNode assigned = api.createDriver(school, "Affecté");
        JsonNode other = api.createDriver(school, "Autre");
        assignedDriverToken = api.driverToken(assigned);
        otherDriverToken = api.driverToken(other);
        route = api.createRoute(school, "Ligne 1", assigned.get("id").asText()).get("id").asText();
        otherRoute = api.createRoute(school, "Ligne 2", other.get("id").asText()).get("id").asText();
    }

    @Test
    void assignedDriverStartsMovesAndStopsTheirBus() throws Exception {
        api.startTrip(assignedDriverToken, route)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tripStatus").value("ACTIVE"));
        api.sendPosition(assignedDriverToken, route)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.livePosition.lat").value(5.36));
        api.stopTrip(assignedDriverToken, route)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tripStatus").value("INACTIVE"));
    }

    @Test
    void driverCannotControlAnotherDriversRoute() throws Exception {
        api.startTrip(otherDriverToken, route).andExpect(status().isForbidden());
        api.sendPosition(otherDriverToken, route).andExpect(status().isForbidden());
        api.stopTrip(otherDriverToken, route).andExpect(status().isForbidden());

        JsonNode live = api.getJson("/api/tracking/routes/" + route, school.adminToken());
        assertEquals("INACTIVE", live.get("tripStatus").asText());
    }

    @Test
    void driverSeesOnlyTheirOwnRoutes() throws Exception {
        JsonNode live = api.getJson("/api/tracking/live", assignedDriverToken);
        assertTrue(containsId(live, "routeId", route));
        assertFalse(containsId(live, "routeId", otherRoute));
    }

    @Test
    void staffWithoutDriverProfileAndParentsCannotControlTrips() throws Exception {
        String secretary = api.tokenFor(api.addUser(school.id(), UserRole.STAFF));
        api.startTrip(secretary, route).andExpect(status().isForbidden());

        String parent = api.tokenFor(api.addUser(school.id(), UserRole.PARENT));
        api.startTrip(parent, route).andExpect(status().isForbidden());
    }
}
