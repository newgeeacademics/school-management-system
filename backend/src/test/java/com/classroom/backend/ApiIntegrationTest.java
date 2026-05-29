package com.classroom.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Exercises all REST endpoints via MockMvc (no manual server required).
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String adminToken;
    private static String teacherId;
    private static String classId;
    private static String studentId;
    private static String matiereId;
    private static String courseId;
    private static String roomId;
    private static String eventId;
    private static String scheduleId;
    private static String evaluationId;
    private static String gradeId;
    private static String parentId;
    private static String reminderId;
    private static String receiptId;
    private static String canteenId;
    private static String transportId;
    private static String schoolId;
    private static String attendanceId;

    private String authHeader() {
        return "Bearer " + adminToken;
    }

    @Test
    @Order(1)
    void auth_login() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@classroom.com\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@classroom.com\",\"password\":\"admin123\"}"))
                .andReturn();
        adminToken = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
        Assertions.assertNotNull(adminToken);
    }

    @Test
    @Order(2)
    void overview() throws Exception {
        mockMvc.perform(get("/api/overview").header("Authorization", authHeader()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalStudents").exists());
    }

    @Test
    @Order(10)
    void teachers_crud() throws Exception {
        mockMvc.perform(get("/api/teachers").header("Authorization", authHeader()))
                .andExpect(status().isOk());

        MvcResult create = mockMvc.perform(post("/api/teachers")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test Teacher\",\"subject\":\"Mathématiques\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        teacherId = objectMapper.readTree(create.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/teachers/" + teacherId).header("Authorization", authHeader()))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/teachers/" + teacherId)
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test Teacher Updated\",\"subject\":\"Français\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @Order(11)
    void classes_crud() throws Exception {
        mockMvc.perform(get("/api/classes").header("Authorization", authHeader()))
                .andExpect(status().isOk());

        String body = String.format(
                "{\"name\":\"6ème A\",\"level\":\"Collège - 6ème\",\"studentsCount\":25,\"homeroomTeacherId\":\"%s\"}",
                teacherId);

        MvcResult create = mockMvc.perform(post("/api/classes")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        classId = objectMapper.readTree(create.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/classes/" + classId).header("Authorization", authHeader()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/classes/level/{level}", "Collège - 6ème")
                        .header("Authorization", authHeader()))
                .andExpect(status().isOk());
    }

    @Test
    @Order(12)
    void students_crud() throws Exception {
        String body = String.format("{\"name\":\"Jean Dupont\",\"classId\":\"%s\"}", classId);

        MvcResult create = mockMvc.perform(post("/api/students")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        studentId = objectMapper.readTree(create.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/students").header("Authorization", authHeader()))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/students/" + studentId).header("Authorization", authHeader()))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/students/class/" + classId).header("Authorization", authHeader()))
                .andExpect(status().isOk());
    }

    @Test
    @Order(13)
    void parents_crud() throws Exception {
        String body = String.format(
                "{\"name\":\"Marie Dupont\",\"phone\":\"+33123456789\",\"email\":\"marie@test.com\",\"studentId\":\"%s\"}",
                studentId);

        MvcResult create = mockMvc.perform(post("/api/parents")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        parentId = objectMapper.readTree(create.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/parents").header("Authorization", authHeader())).andExpect(status().isOk());
        mockMvc.perform(get("/api/parents/student/" + studentId).header("Authorization", authHeader()))
                .andExpect(status().isOk());
    }

    @Test
    @Order(14)
    void matieres_and_courses_crud() throws Exception {
        MvcResult m = mockMvc.perform(post("/api/matieres")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Mathématiques Test " + System.currentTimeMillis() + "\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        matiereId = objectMapper.readTree(m.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/matieres").header("Authorization", authHeader())).andExpect(status().isOk());

        String courseBody = String.format(
                "{\"name\":\"\",\"matiereId\":\"%s\",\"level\":\"Collège\"}", matiereId);
        MvcResult c = mockMvc.perform(post("/api/courses")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(courseBody))
                .andExpect(status().isCreated())
                .andReturn();
        courseId = objectMapper.readTree(c.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/courses/matiere/" + matiereId).header("Authorization", authHeader()))
                .andExpect(status().isOk());
    }

    @Test
    @Order(15)
    void rooms_crud() throws Exception {
        MvcResult r = mockMvc.perform(post("/api/rooms")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Salle 101\",\"type\":\"Salle de classe\",\"capacity\":30}"))
                .andExpect(status().isCreated())
                .andReturn();
        roomId = objectMapper.readTree(r.getResponse().getContentAsString()).get("id").asText();
        mockMvc.perform(get("/api/rooms").header("Authorization", authHeader())).andExpect(status().isOk());
    }

    @Test
    @Order(16)
    void calendar_crud() throws Exception {
        MvcResult e = mockMvc.perform(post("/api/calendar")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"Réunion parents\",\"date\":\"2026-06-01\",\"time\":\"14h00\",\"type\":\"REUNION\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        eventId = objectMapper.readTree(e.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/calendar").header("Authorization", authHeader())).andExpect(status().isOk());
        mockMvc.perform(get("/api/calendar/date/2026-06-01").header("Authorization", authHeader()))
                .andExpect(status().isOk());
    }

    @Test
    @Order(17)
    void schedule_crud() throws Exception {
        String body = String.format(
                "{\"classId\":\"%s\",\"courseId\":\"%s\",\"day\":\"Lundi\",\"time\":\"8h00 – 9h00\",\"room\":\"Salle 101\"}",
                classId, courseId);

        MvcResult s = mockMvc.perform(post("/api/schedule")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        scheduleId = objectMapper.readTree(s.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/schedule/class/" + classId).header("Authorization", authHeader()))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/schedule/day/Lundi").header("Authorization", authHeader()))
                .andExpect(status().isOk());
    }

    @Test
    @Order(18)
    void attendance_crud() throws Exception {
        String body = String.format(
                "{\"date\":\"2026-05-13\",\"classId\":\"%s\",\"studentId\":\"%s\",\"status\":\"PRESENT\"}",
                classId, studentId);

        MvcResult a = mockMvc.perform(post("/api/attendance")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        attendanceId = objectMapper.readTree(a.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/attendance/student/" + studentId).header("Authorization", authHeader()))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/attendance/stats/" + studentId).header("Authorization", authHeader()))
                .andExpect(status().isOk());
    }

    @Test
    @Order(19)
    void grades_crud() throws Exception {
        String evalBody = String.format(
                "{\"classId\":\"%s\",\"courseId\":\"%s\",\"label\":\"Devoir 1\",\"date\":\"2026-05-10\","
                        + "\"period\":\"TRIMESTRE_1\",\"type\":\"DEVOIR\",\"coefficient\":2,\"maxScore\":20}",
                classId, courseId);

        MvcResult ev = mockMvc.perform(post("/api/grades/evaluations")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(evalBody))
                .andExpect(status().isCreated())
                .andReturn();
        evaluationId = objectMapper.readTree(ev.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/grades/evaluations").header("Authorization", authHeader()))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/grades/evaluations/class/" + classId).header("Authorization", authHeader()))
                .andExpect(status().isOk());

        String gradeBody = String.format(
                "{\"evaluationId\":\"%s\",\"studentId\":\"%s\",\"score\":15}", evaluationId, studentId);
        MvcResult g = mockMvc.perform(post("/api/grades")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(gradeBody))
                .andExpect(status().isCreated())
                .andReturn();
        gradeId = objectMapper.readTree(g.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/grades/averages/class/" + classId).header("Authorization", authHeader()))
                .andExpect(status().isOk());
    }

    @Test
    @Order(20)
    void payments_crud() throws Exception {
        MvcResult rem = mockMvc.perform(post("/api/payments/reminders")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentName\":\"Marie Dupont\",\"studentName\":\"Jean Dupont\",\"amount\":50000,\"dueDate\":\"2026-06-30\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        reminderId = objectMapper.readTree(rem.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(patch("/api/payments/reminders/" + reminderId + "/status?status=PAYE")
                        .header("Authorization", authHeader()))
                .andExpect(status().isOk());

        MvcResult rec = mockMvc.perform(post("/api/payments/receipts")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentName\":\"Marie Dupont\",\"amount\":50000,\"date\":\"2026-05-13\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        receiptId = objectMapper.readTree(rec.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/payments/reminders").header("Authorization", authHeader()))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/payments/receipts").header("Authorization", authHeader()))
                .andExpect(status().isOk());
    }

    @Test
    @Order(21)
    void canteen_crud() throws Exception {
        MvcResult c = mockMvc.perform(post("/api/canteen")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"day\":\"Lundi\",\"mealType\":\"DEJEUNER\",\"dish\":\"Riz au poulet\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        canteenId = objectMapper.readTree(c.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/canteen/day/Lundi").header("Authorization", authHeader()))
                .andExpect(status().isOk());
    }

    @Test
    @Order(22)
    void transport_crud() throws Exception {
        MvcResult t = mockMvc.perform(post("/api/transport")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Ligne Nord\",\"driverName\":\"Paul\",\"departureTime\":\"07:30\",\"studentIds\":[\"" + studentId + "\"]}"))
                .andExpect(status().isCreated())
                .andReturn();
        transportId = objectMapper.readTree(t.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/transport/student/" + studentId).header("Authorization", authHeader()))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/transport/" + transportId + "/students")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[\"" + studentId + "\"]"))
                .andExpect(status().isOk());
    }

    @Test
    @Order(23)
    void schools_crud() throws Exception {
        MvcResult s = mockMvc.perform(post("/api/schools")
                        .header("Authorization", authHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"École Test\",\"type\":\"COLLEGE\",\"city\":\"Abidjan\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        schoolId = objectMapper.readTree(s.getResponse().getContentAsString()).get("id").asText();
        mockMvc.perform(get("/api/schools").header("Authorization", authHeader())).andExpect(status().isOk());
    }

    @Test
    @Order(24)
    void users_list() throws Exception {
        mockMvc.perform(get("/api/users").header("Authorization", authHeader()))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/users/role/ADMIN").header("Authorization", authHeader()))
                .andExpect(status().isOk());
    }

    @Test
    @Order(90)
    void auth_register() throws Exception {
        String email = "apitest" + System.currentTimeMillis() + "@test.com";
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format(
                                "{\"name\":\"API Test\",\"email\":\"%s\",\"password\":\"test1234\",\"role\":\"PARENT\"}",
                                email)))
                .andExpect(status().isCreated());
    }

    @Test
    @Order(99)
    void unauthorized_without_token() throws Exception {
        mockMvc.perform(get("/api/teachers")).andExpect(status().isForbidden());
    }
}
