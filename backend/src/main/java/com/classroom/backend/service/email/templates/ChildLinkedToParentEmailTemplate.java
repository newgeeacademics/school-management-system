package com.classroom.backend.service.email.templates;

import java.util.Map;

public final class ChildLinkedToParentEmailTemplate {

    private ChildLinkedToParentEmailTemplate() {}

    public static String subject(String studentName) {
        return "Enfant associé : " + safe(studentName, "votre enfant");
    }

    public static String text(String parentName, String studentName, String className, String loginUrl) {
        String classPart = className != null && !className.isBlank()
                ? " (classe : " + className.trim() + ")"
                : "";
        return String.join(
                "\n\n",
                "Bonjour " + safe(parentName, "") + ",",
                safe(studentName, "Votre enfant") + " a été rattaché(e) à votre compte parent" + classPart + ".",
                "Connexion : " + safe(loginUrl, ""),
                "— L'équipe NewGee"
        );
    }

    public static String html(
            String schoolName,
            String parentName,
            String studentName,
            String className,
            String loginUrl
    ) {
        String classSuffix = className != null && !className.isBlank()
                ? " (classe " + escapeHtml(className.trim()) + ")"
                : "";
        return EmailTemplateRenderer.render(
                "email/child-linked-parent.html",
                Map.of(
                        "schoolName", escapeHtml(safe(schoolName, "Établissement")),
                        "parentName", escapeHtml(safe(parentName, "")),
                        "studentName", escapeHtml(safe(studentName, "")),
                        "classSuffix", classSuffix,
                        "loginUrl", escapeHtmlAttr(loginUrl),
                        "preheader", escapeHtml("Enfant associé : " + safe(studentName, ""))
                ),
                "<html><body><p>{{studentName}} associé(e) à votre compte.</p></body></html>"
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
