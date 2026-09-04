package com.classroom.backend.service.email.templates;

import java.time.Year;
import java.util.Map;

public final class BrandedMessageEmailTemplate {

    private BrandedMessageEmailTemplate() {}

    public static String html(String subject, String plainContent, String portalUrl, String logoUrl) {
        String safeSubject = escapeHtml(subject == null ? "Message de l'établissement" : subject);
        String body = escapeHtml(plainContent == null ? "" : plainContent).replace("\n", "<br/>");
        String portal = escapeHtmlAttr(normalizeBase(portalUrl));
        String logo = escapeHtmlAttr(logoUrl == null ? portal + "/newgee-logo.png" : logoUrl);

        return EmailTemplateRenderer.render(
                "email/school-message.html",
                Map.of(
                        "subject", safeSubject,
                        "body", body,
                        "portalUrl", portal,
                        "logoUrl", logo,
                        "preheader", escapeHtml(EmailTemplateUtil.preheader(
                                plainContent != null ? plainContent : safeSubject)),
                        "year", String.valueOf(Year.now().getValue())
                ),
                "<html><body><h1>" + safeSubject + "</h1><p>" + body + "</p></body></html>"
        );
    }

    private static String normalizeBase(String appUrl) {
        String trimmed = appUrl == null ? "" : appUrl.trim();
        if (trimmed.isEmpty()) {
            return "http://localhost:5174";
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
