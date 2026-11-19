package com.classroom.backend;

import com.classroom.backend.repository.AppUserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Drivers (staff accounts) must be able to sign in with the password the school chose. */
@SpringBootTest
@AutoConfigureMockMvc
class AccountPasswordOnCreateTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppUserRepository appUserRepository;

    private String adminToken() throws Exception {
        String school = "Lycée Comptes " + UUID.randomUUID();
        String body = objectMapper.writeValueAsString(Map.of(
                "name", "Directeur " + school,
                "email", "admin." + UUID.randomUUID() + "@example.com",
                "password", "secret123",
                "school", Map.of("name", school, "type", "LYCEE")));
        String response = mockMvc.perform(post("/api/auth/register-school")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asText();
    }

    private void createDriver(String token, String email, String password) throws Exception {
        var driver = new java.util.HashMap<String, Object>(Map.of("firstName", "Koffi", "lastName", "Yao", "email", email));
        if (password != null) driver.put("password", password);
        mockMvc.perform(post("/api/drivers")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(driver)))
                .andExpect(status().isCreated());
    }

    private JsonNode login(String email, String password) throws Exception {
        var body = new java.util.HashMap<String, Object>(Map.of("email", email));
        if (password != null) body.put("password", password);
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response);
    }

    @Test
    void driverSignsInWithThePasswordChosenBySchool() throws Exception {
        String email = "driver." + UUID.randomUUID() + "@example.com";
        createDriver(adminToken(), email, "chauffeur1");

        JsonNode auth = login(email, "chauffeur1");
        assertTrue(auth.hasNonNull("token"));
        assertFalse(appUserRepository.findByEmailIgnoreCase(email).orElseThrow().isPasswordSetupRequired());
    }

    @Test
    void driverWithoutPasswordChoosesOneAtFirstSignIn() throws Exception {
        String email = "driver." + UUID.randomUUID() + "@example.com";
        createDriver(adminToken(), email, null);

        JsonNode first = login(email, null);
        assertTrue(first.get("passwordSetupRequired").asBoolean());
        String setupToken = first.get("setupToken").asText();

        mockMvc.perform(post("/api/auth/setup-initial-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("setupToken", setupToken, "newPassword", "nouveau1"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
        assertTrue(login(email, "nouveau1").hasNonNull("token"));
    }
}
