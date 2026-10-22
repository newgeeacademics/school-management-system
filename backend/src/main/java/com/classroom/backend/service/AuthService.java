package com.classroom.backend.service;

import com.classroom.backend.dto.auth.AuthResponse;
import com.classroom.backend.dto.auth.LoginRequest;
import com.classroom.backend.dto.auth.RegisterSchoolRequest;
import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.School;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.AppUserRepository;
import com.classroom.backend.security.FirebaseIdTokenVerifier;
import com.classroom.backend.security.GoogleIdTokenVerifier;
import com.classroom.backend.security.JwtTokenProvider;
import com.classroom.backend.service.email.EmailNotificationService;
import com.classroom.backend.util.PhoneAccountUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final SchoolService schoolService;
    private final EmailNotificationService emailNotificationService;
    private final AccountIdentifierService accountIdentifierService;
    private final UserEmailAuthService userEmailAuthService;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;
    private final FirebaseIdTokenVerifier firebaseIdTokenVerifier;

    @Transactional
    public AuthResponse registerSchool(RegisterSchoolRequest request) {
        if (appUserRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        AppUser user = AppUser.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.ADMIN)
                .emailVerified(false)
                .build();
        user = appUserRepository.save(user);

        School school = schoolService.create(request.getSchool());
        user.setSchoolId(school.getId());
        user = appUserRepository.save(user);

        String token = issueToken(user.getEmail(), request.getPassword());

        emailNotificationService.sendSchoolWelcome(user.getName(), user.getEmail());
        userEmailAuthService.sendVerificationEmail(user);

        String officialEmail = request.getSchool().getOfficialEmail();
        if (officialEmail != null
                && !officialEmail.isBlank()
                && !officialEmail.trim().equalsIgnoreCase(user.getEmail().trim())) {
            String recipientName = request.getSchool().getHeadName();
            if (recipientName == null || recipientName.isBlank()) {
                recipientName = user.getName();
            }
            emailNotificationService.sendSchoolWelcome(recipientName, officialEmail.trim());
        }

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .schoolId(school.getId())
                .emailVerified(user.isEmailVerified())
                .build();
    }

    private String issueToken(String email, String rawPassword) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, rawPassword)
        );
        return jwtTokenProvider.generateToken(authentication);
    }

    public AuthResponse login(LoginRequest request) {
        AppUser user = accountIdentifierService.requireBySignInIdentifier(request.getEmail());
        String principal = accountIdentifierService.canonicalPrincipalName(user);

        if (user.isPasswordSetupRequired()) {
            String setupToken = userEmailAuthService.issuePasswordSetupToken(user);
            return AuthResponse.builder()
                    .passwordSetupRequired(true)
                    .setupToken(setupToken)
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .loginId(user.getLoginId())
                    .role(user.getRole())
                    .schoolId(user.getSchoolId())
                    .emailVerified(user.isEmailVerified())
                    .build();
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadCredentialsException("Mot de passe requis.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(principal, request.getPassword())
        );

        String token = jwtTokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .loginId(user.getLoginId())
                .role(user.getRole())
                .schoolId(user.getSchoolId())
                .emailVerified(user.isEmailVerified())
                .passwordSetupRequired(false)
                .build();
    }

    /**
     * Sign in with a Google ID token. Google proves the e-mail address; access still requires
     * an existing NewGee account with that address (accounts are provisioned by the school).
     */
    @Transactional
    private AppUser findByVerifiedEmail(String email) {
        return appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException("Aucun compte NewGee n'est associé à " + email + "."));
    }

    /**
     * Account for a phone number confirmed by SMS (E.164, e.g. +2250700000000). Numbers saved
     * without the country code are matched on their last 9 digits, only when that is unambiguous.
     */
    private AppUser findByVerifiedPhone(String e164) {
        String normalized = PhoneAccountUtil.normalizePhone(e164);
        return appUserRepository.findByPhone(normalized)
                .or(() -> appUserRepository.findByPhone(normalized.replace("+", "")))
                .or(() -> {
                    String digits = normalized.replaceAll("[^0-9]", "");
                    if (digits.length() < 9) return java.util.Optional.empty();
                    List<AppUser> matches = appUserRepository.findByPhoneEndingWith(digits.substring(digits.length() - 9));
                    return matches.size() == 1 ? java.util.Optional.of(matches.get(0)) : java.util.Optional.empty();
                })
                .orElseThrow(() -> new BadCredentialsException(
                        "Aucun compte NewGee n'est associé à ce numéro. Demandez à l'établissement de l'enregistrer."));
    }

    /** Reads the (not yet verified) issuer only to pick the right verifier. */
    private static boolean isFirebaseToken(String idToken) {
        try {
            String[] parts = idToken.split("\\.");
            if (parts.length < 2) return false;
            String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]), java.nio.charset.StandardCharsets.UTF_8);
            return payload.contains("\"" + FirebaseIdTokenVerifier.ISSUER_PREFIX.replace("/", "\\/"))
                    || payload.contains("\"" + FirebaseIdTokenVerifier.ISSUER_PREFIX);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public AuthResponse loginWithGoogle(String idToken) {
        // Tokens from Firebase Authentication are issued by securetoken.google.com; others come from Google directly.
        AppUser user;
        if (isFirebaseToken(idToken)) {
            FirebaseIdTokenVerifier.FirebaseIdentity identity = firebaseIdTokenVerifier.verify(idToken);
            user = identity.isPhone()
                    ? findByVerifiedPhone(identity.phoneNumber())
                    : findByVerifiedEmail(identity.email());
        } else {
            user = findByVerifiedEmail(googleIdTokenVerifier.verify(idToken).email());
        }

        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
        }
        if (user.isPasswordSetupRequired()) {
            // Invitation accepted through Google or SMS: no password to choose before entering the app.
            user.setPasswordSetupRequired(false);
        }
        user = appUserRepository.save(user);

        String token = jwtTokenProvider.generateTokenFromUsername(
                accountIdentifierService.canonicalPrincipalName(user));

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .loginId(user.getLoginId())
                .role(user.getRole())
                .schoolId(user.getSchoolId())
                .emailVerified(true)
                .passwordSetupRequired(false)
                .build();
    }

    @Transactional
    public AuthResponse completeInitialPasswordSetup(String setupToken, String newPassword) {
        AppUser user = userEmailAuthService.completeInitialPasswordSetup(setupToken, newPassword);
        String principal = accountIdentifierService.canonicalPrincipalName(user);
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(principal, newPassword)
        );
        String token = jwtTokenProvider.generateToken(authentication);
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .loginId(user.getLoginId())
                .role(user.getRole())
                .schoolId(user.getSchoolId())
                .emailVerified(user.isEmailVerified())
                .passwordSetupRequired(false)
                .build();
    }
}
