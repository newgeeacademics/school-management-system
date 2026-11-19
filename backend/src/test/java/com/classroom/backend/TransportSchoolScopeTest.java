package com.classroom.backend;

import com.classroom.backend.TransportTestSupport.School;
import com.classroom.backend.model.AppUser;
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

import java.util.List;
import java.util.Map;

import static com.classroom.backend.TransportTestSupport.containsId;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Transport routes and drivers belong to one establishment: school B cannot see or drive school A's buses. */
@SpringBootTest
@AutoConfigureMockMvc
class TransportSchoolScopeTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private AppUserRepository appUserRepository;
    @Autowired private JwtTokenProvider jwtTokenProvider;

    private TransportTestSupport api;
    private School schoolA;
    private School schoolB;
    private String driverA;
    private String routeA;

    @BeforeEach
    void setUp() throws Exception {
        api = new TransportTestSupport(mockMvc, objectMapper, appUserRepository, jwtTokenProvider);
        schoolA = api.registerSchool("Lycée A");
        schoolB = api.registerSchool("Lycée B");
        JsonNode driver = api.createDriver(schoolA, "Kouassi");
        driverA = driver.get("id").asText();
        routeA = api.createRoute(schoolA, "Ligne A", driverA).get("id").asText();
    }

    @Test
    void routesAndDriversAreStampedWithTheCreatorsSchool() throws Exception {
        JsonNode route = api.getJson("/api/transport/" + routeA, schoolA.adminToken());
        assertEquals(schoolA.id(), route.get("schoolId").asText());

        JsonNode driver = api.getJson("/api/drivers/" + driverA, schoolA.adminToken());
        assertEquals(schoolA.id(), driver.get("schoolId").asText());

        assertTrue(containsId(api.getJson("/api/transport", schoolA.adminToken()), "id", routeA));
        assertTrue(containsId(api.getJson("/api/drivers", schoolA.adminToken()), "id", driverA));
        assertTrue(containsId(api.getJson("/api/tracking/live", schoolA.adminToken()), "routeId", routeA));
    }

    @Test
    void otherSchoolCannotListOrOpenRoutesAndDrivers() throws Exception {
        String tokenB = schoolB.adminToken();

        assertFalse(containsId(api.getJson("/api/transport", tokenB), "id", routeA));
        assertFalse(containsId(api.getJson("/api/drivers", tokenB), "id", driverA));
        assertFalse(containsId(api.getJson("/api/tracking/live", tokenB), "routeId", routeA));

        api.perform(get("/api/transport/" + routeA), tokenB, null).andExpect(status().isNotFound());
        api.perform(get("/api/drivers/" + driverA), tokenB, null).andExpect(status().isNotFound());
        api.perform(get("/api/tracking/routes/" + routeA), tokenB, null).andExpect(status().isForbidden());

        AppUser teacherB = api.addUser(schoolB.id(), UserRole.TEACHER);
        String teacherToken = api.tokenFor(teacherB);
        assertFalse(containsId(api.getJson("/api/transport", teacherToken), "id", routeA));
        assertFalse(containsId(api.getJson("/api/tracking/live", teacherToken), "routeId", routeA));
        api.perform(get("/api/tracking/routes/" + routeA), teacherToken, null).andExpect(status().isForbidden());
    }

    @Test
    void otherSchoolCannotEditOrDeleteRoutesAndDrivers() throws Exception {
        String tokenB = schoolB.adminToken();
        Map<String, Object> routeBody = Map.of("name", "Piratée", "driverName", "X", "departureTime", "08:00");

        api.perform(put("/api/transport/" + routeA), tokenB, routeBody).andExpect(status().isNotFound());
        api.perform(patch("/api/transport/" + routeA + "/students"), tokenB, List.of()).andExpect(status().isNotFound());
        api.perform(delete("/api/transport/" + routeA), tokenB, null).andExpect(status().isNotFound());
        api.perform(put("/api/drivers/" + driverA), tokenB, Map.of("firstName", "X", "lastName", "Y"))
                .andExpect(status().isNotFound());
        api.perform(delete("/api/drivers/" + driverA), tokenB, null).andExpect(status().isNotFound());

        // School B cannot put school A's driver on one of its own routes either.
        api.perform(post("/api/transport"), tokenB,
                        Map.of("name", "Ligne B", "driverId", driverA, "departureTime", "07:00"))
                .andExpect(status().isBadRequest());

        // Still intact for school A.
        JsonNode route = api.getJson("/api/transport/" + routeA, schoolA.adminToken());
        assertEquals("Ligne A", route.get("name").asText());
        api.getJson("/api/drivers/" + driverA, schoolA.adminToken());
    }

    @Test
    void otherSchoolAdminsAndTeachersCannotStartMoveOrStopTheBus() throws Exception {
        String adminB = schoolB.adminToken();
        String teacherB = api.tokenFor(api.addUser(schoolB.id(), UserRole.TEACHER));

        for (String token : List.of(adminB, teacherB)) {
            api.startTrip(token, routeA).andExpect(status().isNotFound());
            api.sendPosition(token, routeA).andExpect(status().isNotFound());
            api.stopTrip(token, routeA).andExpect(status().isNotFound());
        }
        JsonNode live = api.getJson("/api/tracking/routes/" + routeA, schoolA.adminToken());
        assertEquals("INACTIVE", live.get("tripStatus").asText());

        // School A's own admin and teachers still drive their bus.
        String teacherA = api.tokenFor(api.addUser(schoolA.id(), UserRole.TEACHER));
        api.startTrip(schoolA.adminToken(), routeA).andExpect(status().isOk());
        api.sendPosition(teacherA, routeA).andExpect(status().isOk());
        api.stopTrip(teacherA, routeA).andExpect(status().isOk());
    }
}
