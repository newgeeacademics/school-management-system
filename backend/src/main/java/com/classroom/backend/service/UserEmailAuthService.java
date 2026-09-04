package com.classroom.backend.service;

import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.AppUserRepository;
import com.classroom.backend.service.email.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserEmailAuthService {

    private static final long VERIFY_HOURS = 24;
    private static final long RESET_HOURS = 1;

    private final AppUserRepository appUserRepository;
    private final AccountIdentifierService accountIdentifierService;
    private final EmailNotificationService emailNotificationService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void sendVerificationEmail(AppUser user) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }
        if (user.isEmailVerified()) {
            return;
        }
        String token = UUID.randomUUID().toString();
        user.setEmailVerifyToken(token);
        user.setEmailVerifyExpiresAt(Instant.now().plusSeconds(VERIFY_HOURS * 3600));
        appUserRepository.save(user);
        emailNotificationService.sendEmailVerification(user.getName(), user.getEmail(), token, user.getRole());
    }

    @Transactional
    public void verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Lien de confirmation invalide.");
        }
        AppUser user = appUserRepository.findByEmailVerifyToken(token.trim())
                .orElseThrow(() -> new RuntimeException("Lien de confirmation invalide ou expiré."));
        if (user.getEmailVerifyExpiresAt() == null || user.getEmailVerifyExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Lien de confirmation expiré.");
        }
        user.setEmailVerified(true);
        user.setEmailVerifyToken(null);
        user.setEmailVerifyExpiresAt(null);
        appUserRepository.save(user);
    }

    @Transactional
    public void resendVerification(String email) {
        AppUser user = accountIdentifierService.findBySignInIdentifier(email)
                .orElse(null);
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }
        sendVerificationEmail(user);
    }

    /** Always succeeds from caller's perspective (no account enumeration). */
    @Transactional
    public void requestPasswordReset(String identifier) {
        AppUser user = accountIdentifierService.findBySignInIdentifier(identifier).orElse(null);
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }
        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setPasswordResetExpiresAt(Instant.now().plusSeconds(RESET_HOURS * 3600));
        appUserRepository.save(user);
        emailNotificationService.sendPasswordReset(user.getName(), user.getEmail(), token, user.getRole());
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Lien de réinitialisation invalide.");
        }
        AppUser user = appUserRepository.findByPasswordResetToken(token.trim())
                .orElseThrow(() -> new RuntimeException("Lien de réinitialisation invalide ou expiré."));
        if (user.getPasswordResetExpiresAt() == null || user.getPasswordResetExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Lien de réinitialisation expiré.");
        }
        applyNewPassword(user, newPassword);
    }

    @Transactional
    public String issuePasswordSetupToken(AppUser user) {
        if (user == null) {
            throw new IllegalArgumentException("Utilisateur introuvable.");
        }
        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setPasswordResetExpiresAt(Instant.now().plusSeconds(RESET_HOURS * 3600));
        appUserRepository.save(user);
        return token;
    }

    @Transactional
    public AppUser completeInitialPasswordSetup(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Session de création de mot de passe invalide.");
        }
        AppUser user = appUserRepository.findByPasswordResetToken(token.trim())
                .orElseThrow(() -> new RuntimeException("Session expirée. Reconnectez-vous avec votre identifiant."));
        if (user.getPasswordResetExpiresAt() == null || user.getPasswordResetExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Session expirée. Reconnectez-vous avec votre identifiant.");
        }
        if (!user.isPasswordSetupRequired()) {
            throw new RuntimeException("Ce compte a déjà un mot de passe. Utilisez « Mot de passe oublié ».");
        }
        applyNewPassword(user, newPassword);
        user.setPasswordSetupRequired(false);
        return appUserRepository.save(user);
    }

    private void applyNewPassword(AppUser user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        appUserRepository.save(user);
    }
}
