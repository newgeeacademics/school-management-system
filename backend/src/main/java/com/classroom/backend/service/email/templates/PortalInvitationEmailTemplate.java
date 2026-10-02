package com.classroom.backend.service.email.templates;

import java.time.Year;
import java.util.Map;

public final class PortalInvitationEmailTemplate {

    private PortalInvitationEmailTemplate() {}

    public static String subject() {
        return "Activez votre accès portail NewGee";
    }

    public static String text(
            String displayName,
            String roleLabel,
            String loginId,
            String contactEmail,
            String activateUrl
    ) {
        return String.join(
                "\n\n",
                "Bonjour " + safe(displayName, "") + ",",
                "Votre établissement vous a ouvert un accès NewGee (" + safe(roleLabel, "portail") + ").",
                "Identifiant de connexion : " + safe(loginId, contactEmail),
                "E-mail : " + safe(contactEmail, ""),
                "Cliquez pour créer votre mot de passe et accéder au portail :",
                safe(activateUrl, ""),
                "Ce lien est valable 7 jours.",
                "— L'équipe NewGee"
        );
    }

    public static String html(
            String displayName,
            String roleLabel,
            String loginId,
            String contactEmail,
            String activateUrl,
            String logoUrl
    ) {
        return EmailTemplateRenderer.render(
                "email/portal-invitation.html",
                Map.of(
                        "displayName", escapeHtml(displayName),
                        "roleLabel", escapeHtml(roleLabel),
                        "loginId", escapeHtml(loginId),
                        "contactEmail", escapeHtml(contactEmail),
                        "activateUrl", escapeHtmlAttr(activateUrl),
                        "logoUrl", escapeHtmlAttr(logoUrl),
                        "preheader", escapeHtml(EmailTemplateUtil.preheader(
                                "Activez votre compte portail NewGee.")),
                        "year", String.valueOf(Year.now().getValue())
                ),
                "<html><body><p>Bonjour {{displayName}}</p><p><a href=\"{{activateUrl}}\">Activer mon compte</a></p></body></html>"
        );
    }

    private static String safe(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
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
