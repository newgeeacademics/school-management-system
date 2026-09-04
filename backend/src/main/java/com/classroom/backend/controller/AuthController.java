package com.classroom.backend.controller;

import com.classroom.backend.dto.auth.AuthResponse;
import com.classroom.backend.dto.auth.ForgotPasswordRequest;
import com.classroom.backend.dto.auth.LoginRequest;
import com.classroom.backend.dto.auth.RegisterRequest;
import com.classroom.backend.dto.auth.RegisterSchoolRequest;
import com.classroom.backend.dto.auth.ResendVerificationRequest;
import com.classroom.backend.dto.auth.ResetPasswordRequest;
import com.classroom.backend.dto.auth.SetupInitialPasswordRequest;
import com.classroom.backend.repository.SchoolRepository;
import com.classroom.backend.service.AuthService;
import com.classroom.backend.service.UserEmailAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserEmailAuthService userEmailAuthService;
    private final SchoolRepository schoolRepository;

    /** Self-service registration is disabled — accounts are provisioned by the school admin. */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "error", "Inscription fermée. Seuls les comptes créés par l'établissement peuvent se connecter."
        ));
    }

    /** Creates admin account + school in one transaction (used by main site registration). */
    @PostMapping("/register-school")
    public ResponseEntity<AuthResponse> registerSchool(@Valid @RequestBody RegisterSchoolRequest request) {
        AuthResponse response = authService.registerSchool(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /** Check whether a legal registration / RCCM number is already used. */
    @GetMapping("/verify-registration-number")
    public ResponseEntity<Map<String, Object>> verifyRegistrationNumber(@RequestParam String number) {
        String normalized = number == null ? "" : number.trim();
        if (normalized.isBlank()) {
            return ResponseEntity.ok(Map.of(
                    "available", true,
                    "message", "Numéro vide."
            ));
        }
        boolean taken = schoolRepository.existsByRegistrationNumberIgnoreCase(normalized);
        return ResponseEntity.ok(Map.of(
                "available", !taken,
                "message", taken ? "Ce numéro d'identification est déjà enregistré." : "Numéro disponible."
        ));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, Object>> verifyEmail(@RequestParam String token) {
        userEmailAuthService.verifyEmail(token);
        return ResponseEntity.ok(Map.of(
                "verified", true,
                "message", "Adresse e-mail confirmée."
        ));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, Object>> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        userEmailAuthService.resendVerification(request.getEmail());
        return ResponseEntity.ok(Map.of(
                "message", "Si un compte existe avec cet e-mail, un lien de confirmation a été envoyé."
        ));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userEmailAuthService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(Map.of(
                "message", "Si un compte existe avec cet identifiant, un e-mail de réinitialisation a été envoyé."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userEmailAuthService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of(
                "message", "Mot de passe mis à jour. Vous pouvez vous connecter."
        ));
    }

    @PostMapping("/setup-initial-password")
    public ResponseEntity<AuthResponse> setupInitialPassword(@Valid @RequestBody SetupInitialPasswordRequest request) {
        return ResponseEntity.ok(authService.completeInitialPasswordSetup(
                request.getSetupToken(), request.getNewPassword()));
    }
}
