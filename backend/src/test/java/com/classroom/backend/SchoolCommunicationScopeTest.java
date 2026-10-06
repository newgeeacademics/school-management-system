package com.classroom.backend;

import com.classroom.backend.model.ParentContact;
import com.classroom.backend.repository.ParentContactRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Messages and announcements from one establishment must never reach another one. */
@SpringBootTest
@AutoConfigureMockMvc
class SchoolCommunicationScopeTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ParentContactRepository parentContactRepository;

    private JsonNode registerSchool(String name, String type) throws Exception {
        String email = "admin." + UUID.randomUUID() + "@example.com";
        String body = objectMapper.writeValueAsString(java.util.Map.of(
                "name", "Directeur " + name,
                "email", email,
                "password", "secret123",
                "school", java.util.Map.of("name", name, "type", type)));
        String response = mockMvc.perform(post("/api/auth/register-school")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response);
    }

    private void addParent(String schoolId, String email) {
        ParentContact parent = new ParentContact();
        parent.setName("Parent " + email);
        parent.setEmail(email);
        parent.setSchoolId(schoolId);
        parentContactRepository.save(parent);
    }

    @Test
    void parentMessageOnlyTargetsTheSendersSchool() throws Exception {
        JsonNode schoolA = registerSchool("Lycée A " + UUID.randomUUID(), "LYCEE");
        JsonNode schoolB = registerSchool("Lycée B " + UUID.randomUUID(), "LYCEE");
        addParent(schoolA.get("schoolId").asText(), "a." + UUID.randomUUID() + "@example.com");
        addParent(schoolB.get("schoolId").asText(), "b1." + UUID.randomUUID() + "@example.com");
        addParent(schoolB.get("schoolId").asText(), "b2." + UUID.randomUUID() + "@example.com");

        String response = mockMvc.perform(post("/api/communications/parents")
                        .header("Authorization", "Bearer " + schoolA.get("token").asText())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"subject\":\"Réunion\",\"body\":\"Bonjour\",\"audience\":\"PARENTS\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        assertEquals(1, objectMapper.readTree(response).get("recipientsCount").asInt());
    }

    @Test
    void announcementsAreListedPerSchool() throws Exception {
        JsonNode schoolA = registerSchool("Collège A " + UUID.randomUUID(), "COLLEGE");
        JsonNode schoolB = registerSchool("Collège B " + UUID.randomUUID(), "COLLEGE");

        mockMvc.perform(post("/api/announcements")
                        .header("Authorization", "Bearer " + schoolA.get("token").asText())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Rentrée\",\"body\":\"Lundi 8h\",\"published\":true}"))
                .andExpect(status().isCreated());

        String listB = mockMvc.perform(get("/api/announcements")
                        .header("Authorization", "Bearer " + schoolB.get("token").asText()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        assertEquals(0, objectMapper.readTree(listB).size());

        String listA = mockMvc.perform(get("/api/announcements")
                        .header("Authorization", "Bearer " + schoolA.get("token").asText()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        assertEquals(1, objectMapper.readTree(listA).size());
    }

    @Test
    void schoolCanRunCollegeAndLyceeTogether() throws Exception {
        JsonNode school = registerSchool("Collège-Lycée " + UUID.randomUUID(), "COLLEGE_LYCEE");

        String response = mockMvc.perform(get("/api/schools/" + school.get("schoolId").asText())
                        .header("Authorization", "Bearer " + school.get("token").asText()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        assertEquals("COLLEGE_LYCEE", objectMapper.readTree(response).get("type").asText());
    }
}
