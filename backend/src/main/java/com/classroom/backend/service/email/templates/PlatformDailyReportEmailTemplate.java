package com.classroom.backend.service.email.templates;

import com.classroom.backend.dto.response.PlatformDailyReportSnapshot;
import com.classroom.backend.dto.response.PlatformDailyReportSnapshot.SchoolLine;

import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.Map;

public final class PlatformDailyReportEmailTemplate {

    private static final DateTimeFormatter HEADER_FMT =
            DateTimeFormatter.ofPattern("EEEE d MMMM yyyy, HH:mm");

    private PlatformDailyReportEmailTemplate() {}

    public static String subject(PlatformDailyReportSnapshot snapshot) {
        String date = snapshot.getGeneratedAt() != null
                ? snapshot.getGeneratedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
                : "quotidien";
        return "Rapport plateforme NewGee — " + date;
    }

    public static String html(
            PlatformDailyReportSnapshot s,
            String appUrl,
            String logoUrl
    ) {
        String generated = s.getGeneratedAt() != null
                ? escapeHtml(s.getGeneratedAt().format(HEADER_FMT)) + " GMT"
                : "—";

        StringBuilder body = new StringBuilder();
        body.append("<p style=\"margin:0 0 16px 0;font-size:14px;color:#334155;\">")
                .append("Synthèse automatique de l&apos;activité sur la plateforme NewGee.")
                .append("</p>");
        body.append("<p style=\"margin:0 0 20px 0;font-size:12px;color:#64748b;\">Généré le ")
                .append(generated)
                .append("</p>");

        body.append(metricTable(s));
        body.append(schoolsSection(s));

        String href = escapeHtmlAttr(normalizeBase(appUrl));
        String logo = escapeHtmlAttr(logoUrl == null ? href + "/favicon.ico" : logoUrl);
        String subject = escapeHtml(subject(s));

        return EmailTemplateRenderer.render(
                "email/generic-branded.html",
                Map.of(
                        "subject", subject,
                        "body", body.toString(),
                        "appUrl", href,
                        "logoUrl", logo,
                        "year", String.valueOf(Year.now().getValue())
                ),
                "<html><body>" + body + "</body></html>"
        );
    }

    private static String metricTable(PlatformDailyReportSnapshot s) {
        StringBuilder table = new StringBuilder();
        table.append("<table style=\"width:100%;border-collapse:collapse;font-size:13px;color:#334155;\">");
        row(table, "Établissements inscrits", s.getTotalSchools());
        row(table, "Nouveaux établissements (24 h)", s.getSchoolsRegisteredLast24h());
        row(table, "Élèves", s.getTotalStudents());
        row(table, "Enseignants", s.getTotalTeachers());
        row(table, "Parents", s.getTotalParents());
        row(table, "Classes", s.getTotalClasses());
        row(table, "Cours", s.getTotalCourses());
        row(table, "Salles", s.getTotalRooms());
        row(table, "Lignes transport", s.getTotalTransportRoutes());
        row(table, "Chauffeurs", s.getTotalDrivers());
        row(table, "Comptes admin", s.getTotalAdmins());
        row(table, "Comptes enseignant (portail)", s.getTotalPortalTeachers());
        row(table, "Comptes élève (portail)", s.getTotalPortalStudents());
        row(table, "Comptes parent (portail)", s.getTotalPortalParents());
        row(table, "Comptes personnel", s.getTotalStaffUsers());
        row(table, "Présences enregistrées (veille)", s.getAttendanceRecordsYesterday());
        row(table, "Rappels de paiement en attente", s.getPaymentRemindersPending());
        row(table, "Trajets bus actifs", s.getActiveBusTrips());
        rowText(table, "E-mail opérationnel", s.isEmailConfigured() ? "Oui" : "Non");
        table.append("</table>");
        return table.toString();
    }

    private static void row(StringBuilder table, String label, long value) {
        rowText(table, label, String.valueOf(value));
    }

    private static void rowText(StringBuilder table, String label, String value) {
        table.append("<tr><td style=\"padding:8px 0;border-bottom:1px solid #e2e8f0;\">")
                .append(escapeHtml(label))
                .append("</td><td style=\"padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;\">")
                .append(escapeHtml(value))
                .append("</td></tr>");
    }

    private static String schoolsSection(PlatformDailyReportSnapshot s) {
        if (s.getSchools() == null || s.getSchools().isEmpty()) {
            return "<p style=\"margin:24px 0 0 0;font-size:13px;color:#64748b;\">Aucun établissement inscrit.</p>";
        }
        StringBuilder list = new StringBuilder();
        list.append("<h2 style=\"margin:24px 0 12px 0;font-size:16px;color:#1e293b;\">Établissements</h2>");
        list.append("<ul style=\"margin:0;padding-left:18px;font-size:13px;color:#334155;line-height:1.7;\">");
        for (SchoolLine line : s.getSchools()) {
            list.append("<li><strong>")
                    .append(escapeHtml(line.getName() != null ? line.getName() : "—"))
                    .append("</strong>");
            if (line.getCity() != null && !line.getCity().isBlank()) {
                list.append(" · ").append(escapeHtml(line.getCity()));
            }
            if (line.getCountry() != null && !line.getCountry().isBlank()) {
                list.append(", ").append(escapeHtml(line.getCountry()));
            }
            list.append(" <span style=\"color:#94a3b8;\">(")
                    .append(escapeHtml(line.getCreatedAt() != null ? line.getCreatedAt() : "—"))
                    .append(")</span></li>");
        }
        list.append("</ul>");
        return list.toString();
    }

    private static String normalizeBase(String appUrl) {
        String trimmed = appUrl == null ? "" : appUrl.trim();
        if (trimmed.isEmpty()) {
            return "http://localhost:5173";
        }
        return trimmed.replaceAll("/+$", "");
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
