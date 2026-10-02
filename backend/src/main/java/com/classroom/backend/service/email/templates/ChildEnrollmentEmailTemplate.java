package com.classroom.backend.service.email.templates;

import java.time.Year;
import java.util.Map;

public final class ChildEnrollmentEmailTemplate {

    private ChildEnrollmentEmailTemplate() {}

    public static String subject(String studentName) {
        return "Inscription de " + safe(studentName, "votre enfant");
    }

    public static String text(
            String parentName,
            String studentName,
            String className,
            String loginId,
            String password,
            String loginUrl
    ) {
        String classPart = className != null && !className.isBlank()
                ? " (classe : " + className.trim() + ")"
                : "";
        String passwordLine = password != null && !password.isBlank()
                ? "Mot de passe : " + password.trim()
                : "Mot de passe : à définir lors de la première connexion avec votre identifiant.";
        return String.join(
                "\n\n",
                "Bonjour" + (parentName != null && !parentName.isBlank() ? " " + parentName.trim() : "") + ",",
                "Votre enfant " + safe(studentName, "") + " a été inscrit" + classPart + ".",
                "Identifiant portail : " + safe(loginId, ""),
                passwordLine,
                "Connexion : " + safe(loginUrl, ""),
                "— L'équipe NewGee"
        );
    }

    public static String html(
            String schoolName,
            String parentName,
            String studentName,
            String className,
            String loginId,
            String password,
            String loginUrl,
            String logoUrl
    ) {
        String parentGreeting = parentName != null && !parentName.isBlank()
                ? " " + escapeHtml(parentName.trim())
                : "";
        String classSuffix = className != null && !className.isBlank()
                ? " en classe <strong>" + escapeHtml(className.trim()) + "</strong>"
                : "";
        boolean hasPassword = password != null && !password.isBlank();
        String passwordCell = hasPassword
                ? escapeHtml(password.trim())
                : "À définir à la première connexion avec votre identifiant";
        String credentialsIntro = hasPassword
                ? "Un compte portail élève a été créé. Voici les identifiants de connexion :"
                : "Un compte portail élève a été créé. Connectez-vous avec l'identifiant ci-dessous pour choisir votre mot de passe :";
        return EmailTemplateRenderer.render(
                "email/child-enrollment.html",
                Map.ofEntries(
                        Map.entry("schoolName", escapeHtml(safe(schoolName, "Établissement"))),
                        Map.entry("parentGreeting", parentGreeting),
                        Map.entry("studentName", escapeHtml(safe(studentName, ""))),
                        Map.entry("classSuffix", classSuffix),
                        Map.entry("credentialsIntro", credentialsIntro),
                        Map.entry("loginId", escapeHtml(safe(loginId, ""))),
                        Map.entry("password", passwordCell),
                        Map.entry("loginUrl", escapeHtmlAttr(loginUrl)),
                        Map.entry("logoUrl", escapeHtmlAttr(logoUrl)),
                        Map.entry("preheader", escapeHtml("Inscription de " + safe(studentName, "votre enfant"))),
                        Map.entry("year", String.valueOf(Year.now().getValue()))
                ),
                "<html><body><p>Inscription de {{studentName}}</p></body></html>"
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
