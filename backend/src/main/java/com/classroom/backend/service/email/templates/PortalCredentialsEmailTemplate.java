package com.classroom.backend.service.email.templates;

import java.time.Year;
import java.util.Map;

public final class PortalCredentialsEmailTemplate {

    private PortalCredentialsEmailTemplate() {}

    public static String subject() {
        return "Vos identifiants portail";
    }

    public static String text(
            String displayName,
            String loginId,
            String contactEmail,
            String password,
            String roleLabel,
            String loginUrl
    ) {
        return String.join(
                "\n\n",
                "Bonjour " + safe(displayName, "") + ",",
                "Votre compte NewGee a été créé.",
                "Rôle : " + safe(roleLabel, ""),
                "Identifiant de connexion : " + safe(loginId, ""),
                "E-mail de contact : " + safe(contactEmail, ""),
                passwordLine(password),
                "Connexion : " + safe(loginUrl, ""),
                "— L'équipe NewGee"
        );
    }

    private static String passwordLine(String password) {
        if (password != null && !password.isBlank()) {
            return "Mot de passe : " + password.trim();
        }
        return "Mot de passe : à définir lors de votre première connexion avec votre identifiant.";
    }

    public static String html(
            String displayName,
            String loginId,
            String contactEmail,
            String password,
            String roleLabel,
            String loginUrl,
            String logoUrl
    ) {
        String passwordCell = password != null && !password.isBlank()
                ? escapeHtml(password.trim())
                : "À définir à la première connexion";
        return EmailTemplateRenderer.render(
                "email/portal-credentials.html",
                Map.of(
                        "displayName", escapeHtml(displayName),
                        "loginId", escapeHtml(loginId),
                        "contactEmail", escapeHtml(contactEmail),
                        "password", passwordCell,
                        "passwordHint", password != null && !password.isBlank()
                                ? "Nous vous recommandons de modifier votre mot de passe après la première connexion."
                                : "Connectez-vous avec votre identifiant : le portail vous demandera de créer votre mot de passe.",
                        "roleLabel", escapeHtml(roleLabel),
                        "loginUrl", escapeHtmlAttr(loginUrl),
                        "logoUrl", escapeHtmlAttr(logoUrl),
                        "preheader", escapeHtml(EmailTemplateUtil.preheader(
                                "Vos identifiants portail NewGee — identifiant " + safe(loginId, ""))),
                        "year", String.valueOf(Year.now().getValue())
                ),
                "<html><body><p>Bonjour {{displayName}}</p><p>Identifiant: {{loginId}}</p></body></html>"
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
