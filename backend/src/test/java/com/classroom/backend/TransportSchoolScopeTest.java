package com.classroom.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** One school never sees nor runs another school's routes, drivers or buses. */
@SpringBootTest
@AutoConfigureMockMvc
class TransportSchoolScopeTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private JsonNode send(MockHttpServletRequestBuilder request, String token, Object body, int expected) throws Exception {
        if (token != null) request.header("Authorization", "Bearer " + token);
        if (body != null) request.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(body));
        String response = mockMvc.perform(request).andExpect(status().is(expected)).andReturn().getResponse().getContentAsString();
        return response.isEmpty() ? null : objectMapper.readTree(response);
    }

    private String school(String name) throws Exception {
        return send(post("/api/auth/register-school"), null, Map.of(
                "name", "Directeur " + name,
                "email", "admin." + UUID.randomUUID() + "@example.com",
                "password", "secret123",
                "school", Map.of("name", name + " " + UUID.randomUUID(), "type", "LYCEE")), 201).get("token").asText();
    }

    private String driver(String admin) throws Exception {
        return send(post("/api/drivers"), admin, Map.of(
                "firstName", "Koffi", "lastName", "Yao", "email", "driver." + UUID.randomUUID() + "@example.com",
                "password", "chauffeur1"), 201).get("id").asText();
    }

    private String student(String admin) throws Exception {
        String classId = send(post("/api/classes"), admin, Map.of("name", "6e A", "level", "Collège - 6ème", "studentsCount", 30), 201)
                .get("id").asText();
        return send(post("/api/students"), admin, Map.of(
                "name", "Aya Koné", "classId", classId, "email", "student." + UUID.randomUUID() + "@example.com"), 201).get("id").asText();
    }

    private Map<String, Object> route(String driverId, List<String> studentIds) {
        return Map.of(
                "name", "Ligne " + UUID.randomUUID(),
                "driverId", driverId,
                "departureTime", "07:00",
                "studentIds", studentIds,
                "waypoints", List.of(Map.of("lat", 5.36, "lng", -4.01, "name", "Départ"), Map.of("lat", 5.37, "lng", -4.02, "name", "École")));
    }

    private static boolean containsId(JsonNode list, String id, String field) {
        for (JsonNode n : list) if (id.equals(n.get(field).asText())) return true;
        return false;
    }

    @Test
    void schoolsOnlySeeAndRunTheirOwnTransport() throws Exception {
        String adminA = school("Lycée A");
        String adminB = school("Lycée B");
        String driverA = driver(adminA);
        String studentA = student(adminA);
        String driverB = driver(adminB);
        String studentB = student(adminB);
        String routeA = send(post("/api/transport"), adminA, route(driverA, List.of(studentA)), 201).get("id").asText();
        String routeB = send(post("/api/transport"), adminB, route(driverB, List.of(studentB)), 201).get("id").asText();

        // Lists are per school.
        JsonNode routesA = send(get("/api/transport"), adminA, null, 200);
        assertTrue(containsId(routesA, routeA, "id"));
        assertFalse(containsId(routesA, routeB, "id"));
        assertFalse(containsId(send(get("/api/drivers"), adminA, null, 200), driverB, "id"));
        assertTrue(containsId(send(get("/api/drivers"), adminB, null, 200), driverB, "id"));
        JsonNode liveB = send(get("/api/tracking/live"), adminB, null, 200);
        assertTrue(containsId(liveB, routeB, "routeId"));
        assertFalse(containsId(liveB, routeA, "routeId"));

        // School B cannot open, edit, delete or run school A's route or driver.
        send(get("/api/transport/" + routeA), adminB, null, 404);
        send(put("/api/transport/" + routeA), adminB, route(driverB, List.of()), 404);
        send(delete("/api/transport/" + routeA), adminB, null, 404);
        send(get("/api/drivers/" + driverA), adminB, null, 404);
        send(post("/api/tracking/routes/" + routeA + "/trips/start"), adminB, null, 403);
        send(get("/api/tracking/routes/" + routeA), adminB, null, 400);

        // Nor put school A's driver or student on its own route.
        send(post("/api/transport"), adminB, route(driverA, List.of()), 400);
        send(post("/api/transport"), adminB, route(driverB, List.of(studentA)), 400);

        // School A still runs its own bus.
        JsonNode started = send(post("/api/tracking/routes/" + routeA + "/trips/start"), adminA, null, 200);
        assertEquals("ACTIVE", started.get("tripStatus").asText());
        send(get("/api/transport/" + routeA), adminA, null, 200);
        assertEquals(1, send(get("/api/tracking/routes/" + routeA), adminA, null, 200).get("students").size());
    }
}
