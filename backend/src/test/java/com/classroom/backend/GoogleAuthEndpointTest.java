package com.classroom.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.google.client-ids=test-client.apps.googleusercontent.com")
@AutoConfigureMockMvc
class GoogleAuthEndpointTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void rejectsForgedIdToken() throws Exception {
        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"idToken\":\"eyJhbGciOiJub25lIn0.eyJlbWFpbCI6ImFkbWluQGNsYXNzcm9vbS5jb20ifQ.\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void requiresIdToken() throws Exception {
        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
