package com.classroom.backend.service.email.templates;

import java.time.Year;
import java.util.Map;

public final class PortalCredentialsEmailTemplate {

    private PortalCredentialsEmailTemplate() {}

    public static String subject() {
        return "Vos identifiants portail";
    }

    public static String text(String displayName, String email, String password, String roleLabel, String loginUrl) {
        return String.join(
                "\n\n",
                "Bonjour " + safe(displayName, "") + ",",
                "Votre compte NewGee a été créé.",
                "Rôle : " + safe(roleLabel, ""),
                "Email : " + safe(email, ""),
                "Mot de passe : " + safe(password, ""),
                "Connexion : " + safe(loginUrl, ""),
                "Changez votre mot de passe après la première connexion.",
                "— L'équipe NewGee"
        );
    }

    public static String html(
            String displayName,
            String email,
            String password,
            String roleLabel,
            String loginUrl,
            String logoUrl
    ) {
        return EmailTemplateRenderer.render(
                "email/portal-credentials.html",
                Map.of(
                        "displayName", escapeHtml(displayName),
                        "email", escapeHtml(email),
                        "password", escapeHtml(password),
                        "roleLabel", escapeHtml(roleLabel),
                        "loginUrl", escapeHtmlAttr(loginUrl),
                        "logoUrl", escapeHtmlAttr(logoUrl),
                        "year", String.valueOf(Year.now().getValue())
                ),
                "<html><body><p>Bonjour {{displayName}}</p><p>Email: {{email}}</p><p>Mot de passe: {{password}}</p></body></html>"
        );
    }

    private static String safe(String value, String fallback) {
        if (value == null) {
            return fallback;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? fallback : trimmed;
    }

    private static String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
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
