package com.classroom.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PublicAppUrlService {

    @Value("${app.public.main-url:http://localhost:5173}")
    private String mainUrl;

    public String studentCardScanUrl(String studentId) {
        return trimTrailingSlash(mainUrl) + "/carte/eleve/" + studentId;
    }

    public String teacherCardScanUrl(String teacherId) {
        return trimTrailingSlash(mainUrl) + "/carte/enseignant/" + teacherId;
    }

    private static String trimTrailingSlash(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:5173";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
