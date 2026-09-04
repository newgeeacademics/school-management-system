package com.classroom.backend.service.email.templates;

import java.time.Year;
import java.util.Map;

public final class PasswordResetEmailTemplate {

    private PasswordResetEmailTemplate() {}

    public static String subject() {
        return "Réinitialisation de votre mot de passe";
    }

    public static String text(String displayName, String resetUrl) {
        return "Bonjour " + safe(displayName, "") + ",\n\n"
                + "Réinitialisez votre mot de passe (lien valide 1 h) :\n"
                + safe(resetUrl, "") + "\n\n— NewGee";
    }

    public static String html(String displayName, String resetUrl, String logoUrl) {
        return EmailTemplateRenderer.render(
                "email/password-reset.html",
                Map.of(
                        "displayName", escapeHtml(safe(displayName, "Bonjour")),
                        "resetUrl", escapeHtmlAttr(safe(resetUrl, "")),
                        "logoUrl", escapeHtmlAttr(safe(logoUrl, "")),
                        "preheader", escapeHtml(EmailTemplateUtil.preheader(
                                "Réinitialisation de mot de passe NewGee.")),
                        "year", String.valueOf(Year.now().getValue())
                ),
                "<html><body><p>Réinitialisez votre mot de passe : <a href=\"" + escapeHtmlAttr(safe(resetUrl, "")) + "\">lien</a></p></body></html>"
        );
    }

    private static String safe(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private static String escapeHtml(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }

    private static String escapeHtmlAttr(String value) {
        return escapeHtml(value);
    }
}
