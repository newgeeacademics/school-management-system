package com.classroom.backend;

import com.classroom.backend.repository.AppUserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "spring.profiles.active=default")
@TestPropertySource(properties = {
        "app.jwt.secret=test-jwt-secret-min-256-bits-for-unit-tests-only-xxxxxxxx",
        "app.jwt.expiration-ms=86400000"
})
@AutoConfigureMockMvc
class PortalInvitationFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppUserRepository appUserRepository;

    @Test
    void inviteTeacherThenActivateWithToken() throws Exception {
        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@classroom.com\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk())
                .andReturn();
        String adminJwt = objectMapper.readTree(login.getResponse().getContentAsString()).get("token").asText();

        String email = "invite." + UUID.randomUUID() + "@example.com";
        String teacherBody = String.format(
                "{\"firstName\":\"Marie\",\"lastName\":\"Invite\",\"email\":\"%s\",\"subject\":\"Mathématiques\"}",
                email);

        mockMvc.perform(post("/api/teachers")
                        .header("Authorization", "Bearer " + adminJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(teacherBody))
                .andExpect(status().isCreated());

        var user = appUserRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertTrue(user.isPasswordSetupRequired());
        String inviteToken = user.getPasswordResetToken();
        assertNotNull(inviteToken);

        mockMvc.perform(get("/api/auth/activation-preview").param("token", inviteToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Marie Invite"))
                .andExpect(jsonPath("$.role").value("TEACHER"));

        mockMvc.perform(post("/api/auth/setup-initial-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format(
                                "{\"setupToken\":\"%s\",\"newPassword\":\"secret12\"}", inviteToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());

        user = appUserRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertFalse(user.isPasswordSetupRequired());
        assertTrue(user.isEmailVerified());
        assertNull(user.getPasswordResetToken());
    }
}
