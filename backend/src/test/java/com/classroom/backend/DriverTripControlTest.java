package com.classroom.backend;

import com.classroom.backend.repository.AppUserRepository;
import com.classroom.backend.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** A driver runs only the routes assigned to them (what the driver app relies on). */
@SpringBootTest
@AutoConfigureMockMvc
class DriverTripControlTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private JsonNode call(String token, String path, Object body, int expectedStatus) throws Exception {
        String response = mockMvc.perform(post(path)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().is(expectedStatus))
                .andReturn().getResponse().getContentAsString();
        return response.isEmpty() ? null : objectMapper.readTree(response);
    }

    /** Creates a driver with a login account and returns {driverId, token}. */
    private String[] addDriver(String adminToken) throws Exception {
        String email = "driver." + UUID.randomUUID() + "@example.com";
        JsonNode driver = call(adminToken, "/api/drivers", Map.of(
                "firstName", "Koffi", "lastName", "Chauffeur", "email", email, "password", "secret123"), 201);
        var account = appUserRepository.findByEmailIgnoreCase(email).orElseThrow();
        return new String[]{driver.get("id").asText(), jwtTokenProvider.generateTokenFromUsername(account.getEmail())};
    }

    private String addRoute(String adminToken, String driverId) throws Exception {
        return call(adminToken, "/api/transport", Map.of(
                "name", "Ligne " + UUID.randomUUID(),
                "driverId", driverId,
                "departureTime", "07:00",
                "waypoints", List.of(
                        Map.of("lat", 5.36, "lng", -4.01, "name", "Départ"),
                        Map.of("lat", 5.37, "lng", -4.02, "name", "École"))), 201).get("id").asText();
    }

    @Test
    void driverRunsOwnRouteButNotAnotherDriversRoute() throws Exception {
        String school = "Lycée Transport " + UUID.randomUUID();
        JsonNode registration = call("", "/api/auth/register-school", Map.of(
                "name", "Directeur " + school,
                "email", "admin." + UUID.randomUUID() + "@example.com",
                "password", "secret123",
                "school", Map.of("name", school, "type", "LYCEE")), 201);
        String adminToken = registration.get("token").asText();

        String[] driverA = addDriver(adminToken);
        String[] driverB = addDriver(adminToken);
        String routeA = addRoute(adminToken, driverA[0]);
        String routeB = addRoute(adminToken, driverB[0]);

        // Driver A sees only their route.
        String live = mockMvc.perform(get("/api/tracking/live").header("Authorization", "Bearer " + driverA[1]))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode routes = objectMapper.readTree(live);
        assertEquals(1, routes.size());
        assertEquals(routeA, routes.get(0).get("routeId").asText());

        // Start, send a position, stop: the full driver flow.
        call(driverA[1], "/api/tracking/routes/" + routeA + "/trips/start", Map.of(), 200);
        JsonNode moved = call(driverA[1], "/api/tracking/routes/" + routeA + "/position",
                Map.of("lat", 5.365, "lng", -4.015, "speedKmh", 32.0), 200);
        assertEquals("ACTIVE", moved.get("tripStatus").asText());
        assertEquals(5.365, moved.get("livePosition").get("lat").asDouble(), 1e-9);

        // Driver A cannot touch driver B's bus.
        mockMvc.perform(post("/api/tracking/routes/" + routeB + "/trips/start")
                        .header("Authorization", "Bearer " + driverA[1]))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Ce trajet n'est pas assigné à votre compte chauffeur."));
        call(driverA[1], "/api/tracking/routes/" + routeB + "/position", Map.of("lat", 1.0, "lng", 1.0), 403);

        JsonNode stopped = call(driverA[1], "/api/tracking/routes/" + routeA + "/trips/stop", Map.of(), 200);
        assertEquals(false, "ACTIVE".equals(stopped.get("tripStatus").asText()));
    }
}
