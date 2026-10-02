package com.classroom.backend.service.email.templates;

import java.time.Year;
import java.util.Map;

public final class EmailVerificationTemplate {

    private EmailVerificationTemplate() {}

    public static String subject() {
        return "Confirmez votre adresse e-mail";
    }

    public static String text(String displayName, String verifyUrl) {
        return "Bonjour " + safe(displayName, "") + ",\n\n"
                + "Confirmez votre e-mail en ouvrant ce lien (valide 24 h) :\n"
                + safe(verifyUrl, "") + "\n\n— NewGee";
    }

    public static String html(String displayName, String verifyUrl, String logoUrl) {
        return EmailTemplateRenderer.render(
                "email/verify-email.html",
                Map.of(
                        "displayName", escapeHtml(safe(displayName, "Bonjour")),
                        "verifyUrl", escapeHtmlAttr(safe(verifyUrl, "")),
                        "logoUrl", escapeHtmlAttr(safe(logoUrl, "")),
                        "preheader", escapeHtml(EmailTemplateUtil.preheader(
                                "Confirmez votre adresse e-mail NewGee.")),
                        "year", String.valueOf(Year.now().getValue())
                ),
                "<html><body><p>Confirmez votre e-mail : <a href=\"" + escapeHtmlAttr(safe(verifyUrl, "")) + "\">lien</a></p></body></html>"
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
