package com.classroom.backend;

import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.Driver;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.AppUserRepository;
import com.classroom.backend.repository.DriverRepository;
import com.classroom.backend.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Subjects belong to one establishment, and direction / secretariat staff can create them. */
@SpringBootTest
@AutoConfigureMockMvc
class MatiereSchoolScopeTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private JsonNode registerSchool(String name) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "name", "Directeur " + name,
                "email", "admin." + UUID.randomUUID() + "@example.com",
                "password", "secret123",
                "school", Map.of("name", name, "type", "LYCEE")));
        String response = mockMvc.perform(post("/api/auth/register-school")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response);
    }

    private AppUser addUser(String schoolId, UserRole role) {
        AppUser user = new AppUser();
        user.setName(role.name() + " test");
        user.setEmail(role.name().toLowerCase() + "." + UUID.randomUUID() + "@example.com");
        user.setPassword("unused");
        user.setRole(role);
        user.setSchoolId(schoolId);
        return appUserRepository.save(user);
    }

    private String tokenFor(AppUser user) {
        return jwtTokenProvider.generateTokenFromUsername(user.getEmail());
    }

    private ResultActions createSubject(String token, String name) throws Exception {
        return mockMvc.perform(post("/api/matieres")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("name", name))));
    }

    private JsonNode listSubjects(String token) throws Exception {
        String response = mockMvc.perform(get("/api/matieres").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response);
    }

    private static boolean containsName(JsonNode list, String name) {
        for (JsonNode node : list) {
            if (name.equals(node.get("name").asText())) {
                return true;
            }
        }
        return false;
    }

    @Test
    void twoSchoolsCanEachCreateTheSameSubject() throws Exception {
        JsonNode schoolA = registerSchool("Lycée A " + UUID.randomUUID());
        JsonNode schoolB = registerSchool("Lycée B " + UUID.randomUUID());
        String name = "Mathématiques " + UUID.randomUUID();

        createSubject(schoolA.get("token").asText(), name).andExpect(status().isCreated());
        createSubject(schoolB.get("token").asText(), name).andExpect(status().isCreated());

        JsonNode onlyInA = registerSchool("Lycée C " + UUID.randomUUID());
        String other = "SVT " + UUID.randomUUID();
        createSubject(onlyInA.get("token").asText(), other).andExpect(status().isCreated());
        assertFalse(containsName(listSubjects(schoolA.get("token").asText()), other));
        assertTrue(containsName(listSubjects(onlyInA.get("token").asText()), other));
    }

    @Test
    void sameSubjectTwiceInOneSchoolIsRefusedWithAClearMessage() throws Exception {
        String token = registerSchool("Collège " + UUID.randomUUID()).get("token").asText();
        String name = "Français " + UUID.randomUUID();

        createSubject(token, name).andExpect(status().isCreated());
        createSubject(token, "  " + name.toUpperCase() + " ")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Cette matière existe déjà dans votre établissement."));
    }

    @Test
    void directionStaffCanCreateSubjectsForTheirSchool() throws Exception {
        JsonNode school = registerSchool("Lycée D " + UUID.randomUUID());
        AppUser secretary = addUser(school.get("schoolId").asText(), UserRole.STAFF);
        String name = "Histoire " + UUID.randomUUID();

        String response = createSubject(tokenFor(secretary), name)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        assertEquals(school.get("schoolId").asText(), objectMapper.readTree(response).get("schoolId").asText());
        assertTrue(containsName(listSubjects(school.get("token").asText()), name));
    }

    @Test
    void teachersAndDriversCannotCreateSubjects() throws Exception {
        JsonNode school = registerSchool("Lycée E " + UUID.randomUUID());
        String schoolId = school.get("schoolId").asText();

        AppUser teacher = addUser(schoolId, UserRole.TEACHER);
        createSubject(tokenFor(teacher), "Physique " + UUID.randomUUID()).andExpect(status().isForbidden());

        AppUser driverAccount = addUser(schoolId, UserRole.STAFF);
        Driver driver = new Driver();
        driver.setName("Chauffeur test");
        driver.setAppUser(driverAccount);
        driverRepository.save(driver);
        createSubject(tokenFor(driverAccount), "Chimie " + UUID.randomUUID())
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value(
                        "Seuls l'administrateur et le personnel de direction de l'établissement peuvent gérer les matières."));
    }
}
