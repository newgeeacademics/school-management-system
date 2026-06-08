package com.classroom.backend.service.email.templates;

import java.time.Year;
import java.util.Map;

public final class WelcomeEmailTemplate {

    private WelcomeEmailTemplate() {}

    public static String subject() {
        return "Bienvenue sur NewGee";
    }

    public static String text(String displayName, String appUrl) {
        String name = safe(displayName, "Bonjour");
        String url = safe(appUrl, "http://localhost:5173");
        return String.join(
                "\n\n",
                "Bonjour " + name + ",",
                "Votre établissement est inscrit sur NewGee.",
                "Accédez au tableau de bord : " + url,
                "— L'équipe NewGee"
        );
    }

    public static String html(String displayName, String appUrl, String logoUrl) {
        String name = escapeHtml(safe(displayName, "Bonjour"));
        String href = escapeHtmlAttr(normalizeBase(safe(appUrl, "http://localhost:5173")));
        String logo = escapeHtmlAttr(safeLogo(logoUrl, normalizeBase(safe(appUrl, "http://localhost:5173"))));

        return EmailTemplateRenderer.render(
                "email/welcome.html",
                Map.of(
                        "displayName", name,
                        "appUrl", href,
                        "logoUrl", logo,
                        "year", String.valueOf(Year.now().getValue())
                ),
                "<html><body><p>Bienvenue " + name + "</p><p><a href=\"" + href + "\">Ouvrir NewGee</a></p></body></html>"
        );
    }

    private static String normalizeBase(String appUrl) {
        String trimmed = appUrl == null ? "" : appUrl.trim();
        if (trimmed.isEmpty()) {
            return "http://localhost:5173";
        }
        return trimmed.replaceAll("/+$", "");
    }

    private static String safeLogo(String logoUrl, String baseNoSlash) {
        if (logoUrl != null && !logoUrl.trim().isBlank()) {
            return logoUrl.trim();
        }
        return baseNoSlash + "/favicon.ico";
    }

    private static String safe(String value, String fallback) {
        if (value == null) {
            return fallback;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? fallback : trimmed;
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
