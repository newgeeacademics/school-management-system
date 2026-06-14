package com.classroom.backend.util;

import com.classroom.backend.model.ClassItem;
import com.classroom.backend.repository.StudentRepository;

import java.time.Year;

public final class MatriculeGenerator {

    private MatriculeGenerator() {}

    public static String next(StudentRepository repository, ClassItem classItem) {
        int year = Year.now().getValue();
        String classCode = classItem != null ? ClassCodeGenerator.slug(classItem.getName()) : "GEN";
        String prefix = year + "-" + classCode + "-";
        long count = repository.countByMatriculeStartingWith(prefix);
        return prefix + String.format("%03d", count + 1);
    }
}
