package com.classroom.backend.service.email;

import com.classroom.backend.service.email.templates.BrandedMessageEmailTemplate;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class EmailService {

    private static final Pattern FROM_PATTERN = Pattern.compile("^\\s*(.*?)\\s*<\\s*([^>]+)\\s*>\\s*$");

    private final JavaMailSender mailSender;
    private final BrevoEmailClient brevo;

    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;

    @Value("${app.email.from:NewGee <contact@newgeeacademy.com>}")
    private String fromEmail;

    @Value("${app.email.subject.prefix:[NewGee]}")
    private String subjectPrefix;

    @Value("${app.email.provider:brevo}")
    private String provider;

    @Value("${app.brevo.api-key:}")
    private String brevoApiKey;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${app.public.main-url:http://localhost:5173}")
    private String publicMainUrl;

    @Value("${app.email.logo-url:}")
    private String emailLogoUrlOverride;

    public EmailService(JavaMailSender mailSender, BrevoEmailClient brevo) {
        this.mailSender = mailSender;
        this.brevo = brevo;
    }

    public boolean isEnabled() {
        return emailEnabled;
    }

    public boolean isConfigured() {
        if (!emailEnabled) {
            return false;
        }
        String p = String.valueOf(provider).trim();
        if ("brevo".equalsIgnoreCase(p)) {
            return !String.valueOf(brevoApiKey).trim().isBlank();
        }
        return fromEmail != null
                && !fromEmail.trim().isBlank()
                && mailHost != null
                && !mailHost.trim().isBlank();
    }

    public String getPublicMainUrlNormalized() {
        String base = publicMainUrl == null ? "" : publicMainUrl.trim().replaceAll("/+$", "");
        return base.isBlank() ? "http://localhost:5173" : base;
    }

    public String resolveEmailLogoUrl() {
        String override = emailLogoUrlOverride == null ? "" : emailLogoUrlOverride.trim();
        if (!override.isBlank()) {
            return override;
        }
        return getPublicMainUrlNormalized() + "/favicon.ico";
    }

    public void sendHtmlEmail(String toEmail, String subject, String htmlContent) throws MessagingException {
        deliverHtmlEmail(toEmail, subject, htmlContent, false);
    }

    public void sendSimpleEmail(String toEmail, String subject, String content) {
        if (toEmail == null || toEmail.trim().isBlank()) {
            return;
        }
        String html = BrandedMessageEmailTemplate.html(
                subject,
                content,
                getPublicMainUrlNormalized(),
                resolveEmailLogoUrl()
        );
        try {
            deliverHtmlEmail(toEmail, subject, html, true);
        } catch (Exception e) {
            log.warn("Email send failed (simple): to={}, subject={}", toEmail, subject, e);
        }
    }

    private void deliverHtmlEmail(String toEmail, String subject, String htmlContent, boolean bestEffort)
            throws MessagingException {
        if (!emailEnabled) {
            log.debug("Email skipped (disabled): to={}, subject={}", toEmail, subject);
            return;
        }

        String p = String.valueOf(provider).trim();
        if ("brevo".equalsIgnoreCase(p)) {
            String apiKey = String.valueOf(brevoApiKey).trim();
            if (apiKey.isBlank()) {
                String message = "Brevo enabled but BREVO_API_KEY is missing";
                if (bestEffort) {
                    log.warn("Email skipped: {}", message);
                    return;
                }
                throw new IllegalStateException(message);
            }
            ParsedFrom from = parseFrom(fromEmail);
            String toName = deriveRecipientName(toEmail);
            Map<String, Object> payload = BrevoEmailClient.buildSingleHtmlEmailPayload(
                    from.email(),
                    from.name(),
                    toEmail,
                    toName,
                    subjectPrefix + " " + subject,
                    htmlContent
            );
            try {
                brevo.sendSmtpEmail(apiKey, payload);
            } catch (Exception e) {
                if (bestEffort) {
                    log.warn("Email send failed (brevo): to={}, subject={}", toEmail, subject, e);
                    return;
                }
                throw new MessagingException("Brevo send failed", e);
            }
            return;
        }

        if (mailHost == null || mailHost.trim().isBlank()) {
            String message = "SMTP is not configured (MAIL_HOST is missing)";
            if (bestEffort) {
                log.warn("Email skipped: {}", message);
                return;
            }
            throw new IllegalStateException(message);
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject(subjectPrefix + " " + subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    private static String deriveRecipientName(String toEmail) {
        String to = toEmail == null ? "" : toEmail.trim();
        int at = to.indexOf('@');
        if (at > 0) {
            return to.substring(0, at);
        }
        return "NewGee";
    }

    private static ParsedFrom parseFrom(String raw) {
        String value = raw == null ? "" : raw.trim();
        if (value.isEmpty()) {
            return new ParsedFrom("NewGee", "contact@newgeeacademy.com");
        }

        Matcher matcher = FROM_PATTERN.matcher(value);
        if (matcher.matches()) {
            String name = (matcher.group(1) == null ? "" : matcher.group(1)).trim();
            String email = (matcher.group(2) == null ? "" : matcher.group(2)).trim();
            if (name.isBlank()) {
                name = "NewGee";
            }
            return new ParsedFrom(name, email);
        }
        if (value.contains("@")) {
            return new ParsedFrom("NewGee", value);
        }
        return new ParsedFrom(value, "contact@newgeeacademy.com");
    }

    private record ParsedFrom(String name, String email) {}
}
