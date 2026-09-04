package com.classroom.backend.service.email;

import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.service.email.templates.ChildEnrollmentEmailTemplate;
import com.classroom.backend.service.email.templates.ChildLinkedToParentEmailTemplate;
import com.classroom.backend.service.email.templates.EmailVerificationTemplate;
import com.classroom.backend.service.email.templates.PasswordResetEmailTemplate;
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

    public void sendEmailVerification(String displayName, String email, String token, UserRole role) {
        if (email == null || email.isBlank() || !emailService.isConfigured()) {
            return;
        }
        String base = role == UserRole.ADMIN
                ? emailService.getPublicMainUrlNormalized()
                : normalizePortalUrl();
        String verifyUrl = base + "/verify-email?token=" + token;
        String subject = EmailVerificationTemplate.subject();
        String html = EmailVerificationTemplate.html(displayName, verifyUrl, emailService.resolveEmailLogoUrl());
        try {
            emailService.sendHtmlEmail(email.trim(), subject, html);
        } catch (Exception e) {
            log.warn("Verification email failed for {}", email, e);
            emailService.sendSimpleEmail(email.trim(), subject, EmailVerificationTemplate.text(displayName, verifyUrl));
        }
    }

    public void sendPasswordReset(String displayName, String email, String token, UserRole role) {
        if (email == null || email.isBlank() || !emailService.isConfigured()) {
            return;
        }
        String base = role == UserRole.ADMIN
                ? emailService.getPublicMainUrlNormalized()
                : normalizePortalUrl();
        String resetUrl = base + "/reset-password?token=" + token;
        String subject = PasswordResetEmailTemplate.subject();
        String html = PasswordResetEmailTemplate.html(displayName, resetUrl, emailService.resolveEmailLogoUrl());
        try {
            emailService.sendHtmlEmail(email.trim(), subject, html);
        } catch (Exception e) {
            log.warn("Password reset email failed for {}", email, e);
            emailService.sendSimpleEmail(email.trim(), subject, PasswordResetEmailTemplate.text(displayName, resetUrl));
        }
    }

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
        // Student enrollment emails are sent separately (parent-oriented).
        if (role == UserRole.STUDENT) {
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

    /** Notifies parent/guardian when a student is enrolled (includes portal credentials). */
    public void sendChildEnrollmentNotification(
            String recipientEmail,
            String schoolName,
            String parentName,
            String studentName,
            String className,
            String loginId,
            String rawPassword
    ) {
        if (recipientEmail == null || recipientEmail.isBlank() || !emailService.isConfigured()) {
            return;
        }
        if (!isRealContactEmail(recipientEmail)) {
            return;
        }
        String loginUrl = normalizePortalUrl() + "/connexion";
        String subject = ChildEnrollmentEmailTemplate.subject(studentName);
        String html = ChildEnrollmentEmailTemplate.html(
                schoolName,
                parentName,
                studentName,
                className,
                loginId,
                rawPassword,
                loginUrl,
                emailService.resolveEmailLogoUrl()
        );
        try {
            emailService.sendHtmlEmail(recipientEmail.trim(), subject, html);
        } catch (Exception e) {
            log.warn("Child enrollment email failed for {}", recipientEmail, e);
            emailService.sendSimpleEmail(
                    recipientEmail.trim(),
                    subject,
                    ChildEnrollmentEmailTemplate.text(
                            parentName, studentName, className, loginId, rawPassword, loginUrl)
            );
        }
    }

    /** Notifies an existing parent account that a child was linked. */
    public void sendChildLinkedToParent(
            String parentEmail,
            String schoolName,
            String parentName,
            String studentName,
            String className
    ) {
        if (parentEmail == null || parentEmail.isBlank() || !emailService.isConfigured()) {
            return;
        }
        if (!isRealContactEmail(parentEmail)) {
            return;
        }
        String loginUrl = normalizePortalUrl() + "/connexion";
        String subject = ChildLinkedToParentEmailTemplate.subject(studentName);
        String html = ChildLinkedToParentEmailTemplate.html(
                schoolName, parentName, studentName, className, loginUrl);
        try {
            emailService.sendHtmlEmail(parentEmail.trim(), subject, html);
        } catch (Exception e) {
            log.warn("Child linked email failed for {}", parentEmail, e);
            emailService.sendSimpleEmail(
                    parentEmail.trim(),
                    subject,
                    ChildLinkedToParentEmailTemplate.text(parentName, studentName, className, loginUrl)
            );
        }
    }

    private static boolean isRealContactEmail(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        String value = email.trim().toLowerCase();
        return value.contains("@")
                && !value.endsWith(".local")
                && !value.contains("@portal.classroom");
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
