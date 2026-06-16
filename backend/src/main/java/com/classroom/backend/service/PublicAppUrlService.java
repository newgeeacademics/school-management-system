package com.classroom.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PublicAppUrlService {

    /** QR codes open the user portal (not the marketing site). */
    @Value("${app.public.portal-url:http://localhost:5174}")
    private String portalUrl;

    public String studentCardScanUrl(String studentId) {
        return trimTrailingSlash(portalUrl) + "/carte/eleve/" + studentId;
    }

    public String teacherCardScanUrl(String teacherId) {
        return trimTrailingSlash(portalUrl) + "/carte/enseignant/" + teacherId;
    }

    private static String trimTrailingSlash(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:5174";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
