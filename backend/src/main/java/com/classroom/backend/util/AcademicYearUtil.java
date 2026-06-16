package com.classroom.backend.util;

import java.time.LocalDate;

public final class AcademicYearUtil {

    private AcademicYearUtil() {
    }

    /** School year label, e.g. 2025-2026 (starts in September). */
    public static String currentLabel() {
        LocalDate today = LocalDate.now();
        int year = today.getYear();
        if (today.getMonthValue() >= 9) {
            return year + "-" + (year + 1);
        }
        return (year - 1) + "-" + year;
    }
}
