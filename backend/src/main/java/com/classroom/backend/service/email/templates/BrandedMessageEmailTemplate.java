package com.classroom.backend.service.email.templates;

import java.time.Year;
import java.util.Map;

public final class BrandedMessageEmailTemplate {

    private BrandedMessageEmailTemplate() {}

    public static String html(String subject, String plainContent, String appUrl, String logoUrl) {
        String safeSubject = escapeHtml(subject == null ? "NewGee" : subject);
        String body = escapeHtml(plainContent == null ? "" : plainContent).replace("\n", "<br/>");
        String href = escapeHtmlAttr(normalizeBase(appUrl));
        String logo = escapeHtmlAttr(logoUrl == null ? href + "/favicon.ico" : logoUrl);

        return EmailTemplateRenderer.render(
                "email/generic-branded.html",
                Map.of(
                        "subject", safeSubject,
                        "body", body,
                        "appUrl", href,
                        "logoUrl", logo,
                        "year", String.valueOf(Year.now().getValue())
                ),
                "<html><body><h1>" + safeSubject + "</h1><p>" + body + "</p></body></html>"
        );
    }

    private static String normalizeBase(String appUrl) {
        String trimmed = appUrl == null ? "" : appUrl.trim();
        if (trimmed.isEmpty()) {
            return "http://localhost:5173";
        }
        return trimmed.replaceAll("/+$", "");
    }

    private static String escapeHtml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private static String escapeHtmlAttr(String value) {
        return escapeHtml(value);
    }
}
