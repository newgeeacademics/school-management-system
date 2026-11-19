package com.classroom.backend;

import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.AppUserRepository;
import com.classroom.backend.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Schools, drivers and routes created through the API, for the transport tests. */
final class TransportTestSupport {

    record School(String id, String adminToken) {}

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper;
    private final AppUserRepository appUserRepository;
    private final JwtTokenProvider jwtTokenProvider;

    TransportTestSupport(MockMvc mockMvc, ObjectMapper objectMapper,
                         AppUserRepository appUserRepository, JwtTokenProvider jwtTokenProvider) {
        this.mockMvc = mockMvc;
        this.objectMapper = objectMapper;
        this.appUserRepository = appUserRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    School registerSchool(String name) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "name", "Directeur " + name,
                "email", "admin." + UUID.randomUUID() + "@example.com",
                "password", "secret123",
                "school", Map.of("name", name + " " + UUID.randomUUID(), "type", "LYCEE")));
        JsonNode response = read(mockMvc.perform(post("/api/auth/register-school")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated()));
        return new School(response.get("schoolId").asText(), response.get("token").asText());
    }

    AppUser addUser(String schoolId, UserRole role) {
        AppUser user = new AppUser();
        user.setName(role.name() + " test");
        user.setEmail(role.name().toLowerCase() + "." + UUID.randomUUID() + "@example.com");
        user.setPassword("unused");
        user.setRole(role);
        user.setSchoolId(schoolId);
        return appUserRepository.save(user);
    }

    String tokenFor(AppUser user) {
        return jwtTokenProvider.generateTokenFromUsername(user.getEmail());
    }

    /** Creates a driver with a staff account; returns the driver JSON (id, email, schoolId…). */
    JsonNode createDriver(School school, String lastName) throws Exception {
        return read(perform(post("/api/drivers"), school.adminToken(), Map.of(
                "firstName", "Chauffeur",
                "lastName", lastName,
                "email", "driver." + UUID.randomUUID() + "@example.com",
                "password", "secret123"))
                .andExpect(status().isCreated()));
    }

    String driverToken(JsonNode driver) {
        return jwtTokenProvider.generateTokenFromUsername(driver.get("email").asText());
    }

    JsonNode createRoute(School school, String name, String driverId) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("name", name);
        body.put("departureTime", "07:00");
        body.put("waypoints", java.util.List.of(Map.of("lat", 5.35, "lng", -4.0, "name", "Arrêt 1")));
        if (driverId != null) {
            body.put("driverId", driverId);
        } else {
            body.put("driverName", "Chauffeur sans compte");
        }
        return read(perform(post("/api/transport"), school.adminToken(), body).andExpect(status().isCreated()));
    }

    ResultActions perform(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request,
                          String token, Object body) throws Exception {
        request.header("Authorization", "Bearer " + token);
        if (body != null) {
            request.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(body));
        }
        return mockMvc.perform(request);
    }

    ResultActions startTrip(String token, String routeId) throws Exception {
        return perform(post("/api/tracking/routes/" + routeId + "/trips/start"), token, null);
    }

    ResultActions stopTrip(String token, String routeId) throws Exception {
        return perform(post("/api/tracking/routes/" + routeId + "/trips/stop"), token, null);
    }

    ResultActions sendPosition(String token, String routeId) throws Exception {
        return perform(post("/api/tracking/routes/" + routeId + "/position"), token,
                Map.of("lat", 5.36, "lng", -4.01, "speedKmh", 30.0));
    }

    JsonNode getJson(String url, String token) throws Exception {
        return read(perform(get(url), token, null).andExpect(status().isOk()));
    }

    static boolean containsId(JsonNode list, String idField, String id) {
        for (JsonNode node : list) {
            if (id.equals(node.path(idField).asText())) {
                return true;
            }
        }
        return false;
    }

    private JsonNode read(ResultActions actions) throws Exception {
        return objectMapper.readTree(actions.andReturn().getResponse().getContentAsString());
    }
}
