package com.classroom.backend.controller;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "UP");
        try {
            Integer ping = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            body.put("database", ping != null && ping == 1 ? "UP" : "DOWN");
            int entityCount = entityManager.getMetamodel().getEntities().size();
            body.put("entities", entityCount);
            body.put("schemaReady", entityCount >= 15);
        } catch (Exception ex) {
            body.put("database", "DOWN");
            body.put("databaseError", ex.getMessage());
            body.put("schemaReady", false);
        }
        return body;
    }
}
