package com.classroom.backend.service.email.templates;

import org.springframework.core.io.ClassPathResource;

import java.nio.charset.StandardCharsets;
import java.util.Map;

public final class EmailTemplateRenderer {

    private EmailTemplateRenderer() {}

    public static String render(String classpathPath, Map<String, String> variables, String fallbackHtml) {
        String template = loadOr(classpathPath, fallbackHtml);
        String out = template;
        if (variables != null) {
            for (Map.Entry<String, String> entry : variables.entrySet()) {
                String key = entry.getKey() == null ? "" : entry.getKey().trim();
                if (key.isEmpty()) {
                    continue;
                }
                String value = entry.getValue() == null ? "" : entry.getValue();
                out = out.replace("{{" + key + "}}", value);
            }
        }
        return out;
    }

    private static String loadOr(String classpathPath, String fallbackHtml) {
        try {
            ClassPathResource resource = new ClassPathResource(classpathPath);
            byte[] bytes = resource.getInputStream().readAllBytes();
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return fallbackHtml;
        }
    }
}
