package com.classroom.backend.service.email;

import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.service.email.EmailNotificationService;
import com.classroom.backend.service.email.templates.PortalCredentialsEmailTemplate;
import com.classroom.backend.service.email.templates.WelcomeEmailTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final EmailService emailService;

    @Value("${app.public.portal-url:http://localhost:5174}")
    private String portalUrl;

    public void sendSchoolWelcome(String displayName, String email) {
        if (email == null || email.isBlank() || !emailService.isConfigured()) {
            return;
        }
        String appUrl = emailService.getPublicMainUrlNormalized() + "/login";
        String subject = WelcomeEmailTemplate.subject();
        String html = WelcomeEmailTemplate.html(displayName, appUrl, emailService.resolveEmailLogoUrl());
        try {
            emailService.sendHtmlEmail(email.trim(), subject, html);
        } catch (Exception e) {
            log.warn("Welcome email failed for {}", email, e);
            try {
                emailService.sendSimpleEmail(email.trim(), subject, WelcomeEmailTemplate.text(displayName, appUrl));
            } catch (Exception ignored) {
                log.warn("Welcome plain email also failed for {}", email);
            }
        }
    }

    public void sendPortalCredentials(
            String displayName,
            String contactEmail,
            String loginId,
            String rawPassword,
            UserRole role
    ) {
        if (contactEmail == null || contactEmail.isBlank() || !emailService.isConfigured()) {
            return;
        }
        String loginUrl = normalizePortalUrl() + "/connexion";
        String roleLabel = roleLabel(role);
        String subject = PortalCredentialsEmailTemplate.subject();
        String resolvedLoginId = loginId != null && !loginId.isBlank() ? loginId.trim() : contactEmail.trim();
        String html = PortalCredentialsEmailTemplate.html(
                displayName,
                resolvedLoginId,
                contactEmail.trim(),
                rawPassword,
                roleLabel,
                loginUrl,
                emailService.resolveEmailLogoUrl()
        );
        try {
            emailService.sendHtmlEmail(contactEmail.trim(), subject, html);
        } catch (Exception e) {
            log.warn("Portal credentials email failed for {}", contactEmail, e);
            emailService.sendSimpleEmail(
                    contactEmail.trim(),
                    subject,
                    PortalCredentialsEmailTemplate.text(
                            displayName, resolvedLoginId, contactEmail, rawPassword, roleLabel, loginUrl)
            );
        }
    }

    private String normalizePortalUrl() {
        String base = portalUrl == null ? "" : portalUrl.trim().replaceAll("/+$", "");
        return base.isBlank() ? "http://localhost:5174" : base;
    }

    private static String roleLabel(UserRole role) {
        if (role == null) {
            return "Utilisateur";
        }
        return switch (role) {
            case ADMIN -> "Administrateur";
            case TEACHER -> "Enseignant";
            case STUDENT -> "Élève";
            case PARENT -> "Parent";
            case STAFF -> "Personnel";
        };
    }
}
