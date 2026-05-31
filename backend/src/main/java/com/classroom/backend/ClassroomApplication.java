package com.classroom.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ClassroomApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(entry -> {
            String key = entry.getKey();
            if (System.getenv(key) == null) {
                System.setProperty(key, entry.getValue());
            }
        });
        String profiles = dotenv.get("SPRING_PROFILES_ACTIVE");
        if (profiles != null && System.getenv("SPRING_PROFILES_ACTIVE") == null
                && System.getProperty("spring.profiles.active") == null) {
            System.setProperty("spring.profiles.active", profiles);
        }
        SpringApplication.run(ClassroomApplication.class, args);
    }
}
