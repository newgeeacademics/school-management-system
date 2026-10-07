package com.classroom.backend.security;

import org.jose4j.jwk.HttpsJwks;
import org.jose4j.jwt.JwtClaims;
import org.jose4j.jwt.consumer.JwtConsumer;
import org.jose4j.jwt.consumer.JwtConsumerBuilder;
import org.jose4j.keys.resolvers.HttpsJwksVerificationKeyResolver;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Verifies Firebase Authentication ID tokens (Google sign-in done through Firebase):
 * signature (Firebase JWKS), issuer and audience bound to the Firebase project, expiry.
 */
@Component
public class FirebaseIdTokenVerifier {

    public static final String ISSUER_PREFIX = "https://securetoken.google.com/";
    private static final String FIREBASE_JWKS_URL =
            "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

    private final String projectId;
    private final HttpsJwksVerificationKeyResolver keyResolver =
            new HttpsJwksVerificationKeyResolver(new HttpsJwks(FIREBASE_JWKS_URL));

    public FirebaseIdTokenVerifier(@Value("${app.firebase.project-id:}") String projectId) {
        this.projectId = projectId == null ? "" : projectId.trim();
    }

    public boolean isConfigured() {
        return !projectId.isEmpty();
    }

    /** Who Firebase vouches for: a verified Google e-mail, or a phone number confirmed by SMS. */
    public record FirebaseIdentity(String provider, String email, String phoneNumber, String name, String subject) {
        public boolean isPhone() {
            return "phone".equals(provider);
        }
    }

    public FirebaseIdentity verify(String idToken) {
        if (!isConfigured()) {
            throw new IllegalStateException("Connexion Firebase non configurée sur le serveur (FIREBASE_PROJECT_ID).");
        }
        JwtConsumer consumer = new JwtConsumerBuilder()
                .setVerificationKeyResolver(keyResolver)
                .setExpectedIssuer(ISSUER_PREFIX + projectId)
                .setExpectedAudience(projectId)
                .setRequireExpirationTime()
                .setRequireSubject()
                .setAllowedClockSkewInSeconds(60)
                .build();
        String email;
        Object emailVerified;
        String phone;
        String name;
        String subject;
        String provider = null;
        try {
            JwtClaims claims = consumer.processToClaims(idToken);
            email = claims.getStringClaimValue("email");
            emailVerified = claims.getClaimValue("email_verified");
            phone = claims.getStringClaimValue("phone_number");
            name = claims.getStringClaimValue("name");
            subject = claims.getSubject();
            Object firebase = claims.getClaimValue("firebase");
            if (firebase instanceof Map<?, ?> map && map.get("sign_in_provider") != null) {
                provider = String.valueOf(map.get("sign_in_provider"));
            }
        } catch (Exception e) {
            throw new BadCredentialsException("Session de connexion invalide ou expirée. Réessayez.");
        }
        if ("phone".equals(provider)) {
            if (phone == null || phone.isBlank()) {
                throw new BadCredentialsException("Numéro de téléphone non vérifié.");
            }
            return new FirebaseIdentity(provider, null, phone.trim(), name, subject);
        }
        if (!"google.com".equals(provider)) {
            throw new BadCredentialsException("Mode de connexion non accepté.");
        }
        boolean verified = Boolean.TRUE.equals(emailVerified) || "true".equals(String.valueOf(emailVerified));
        if (email == null || email.isBlank() || !verified) {
            throw new BadCredentialsException("Adresse Google non vérifiée.");
        }
        return new FirebaseIdentity(provider, email.trim(), null, name, subject);
    }
}
