package com.classroom.backend.util;

import com.classroom.backend.model.ClassItem;
import com.classroom.backend.repository.StudentRepository;

import java.time.Year;
import java.util.Locale;

public final class MatriculeGenerator {

    private MatriculeGenerator() {}

    public static String next(StudentRepository repository, ClassItem classItem) {
        int year = Year.now().getValue();
        String classCode = classItem != null ? slug(classItem.getName()) : "GEN";
        String prefix = year + "-" + classCode + "-";
        long count = repository.countByMatriculeStartingWith(prefix);
        return prefix + String.format("%03d", count + 1);
    }

    private static String slug(String name) {
        if (name == null || name.isBlank()) return "GEN";
        String cleaned = name.replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);
        if (cleaned.length() > 6) cleaned = cleaned.substring(0, 6);
        return cleaned.isBlank() ? "GEN" : cleaned;
    }
}
