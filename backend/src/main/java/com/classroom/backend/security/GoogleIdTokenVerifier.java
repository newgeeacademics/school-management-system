package com.classroom.backend.security;

import org.jose4j.jwk.HttpsJwks;
import org.jose4j.jwt.JwtClaims;
import org.jose4j.jwt.consumer.JwtConsumer;
import org.jose4j.jwt.consumer.JwtConsumerBuilder;
import org.jose4j.keys.resolvers.HttpsJwksVerificationKeyResolver;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/** Verifies Google Identity Services ID tokens: signature (Google JWKS), issuer, audience and expiry. */
@Component
public class GoogleIdTokenVerifier {

    public record GoogleIdentity(String email, String name, String subject) {}

    private static final String GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";

    private final String[] clientIds;
    private final HttpsJwksVerificationKeyResolver keyResolver =
            new HttpsJwksVerificationKeyResolver(new HttpsJwks(GOOGLE_CERTS_URL));

    public GoogleIdTokenVerifier(@Value("${app.google.client-ids:}") String clientIds) {
        this.clientIds = Arrays.stream(clientIds.split(","))
                .map(String::trim)
                .filter(id -> !id.isEmpty())
                .toArray(String[]::new);
    }

    public boolean isConfigured() {
        return clientIds.length > 0;
    }

    public GoogleIdentity verify(String idToken) {
        if (!isConfigured()) {
            throw new IllegalStateException("Connexion Google non configurée sur le serveur (GOOGLE_CLIENT_ID).");
        }
        JwtConsumer consumer = new JwtConsumerBuilder()
                .setVerificationKeyResolver(keyResolver)
                .setExpectedIssuers(true, "https://accounts.google.com", "accounts.google.com")
                .setExpectedAudience(clientIds)
                .setRequireExpirationTime()
                .setRequireSubject()
                .setAllowedClockSkewInSeconds(60)
                .build();
        JwtClaims claims;
        String email;
        Object emailVerified;
        String name;
        String subject;
        try {
            claims = consumer.processToClaims(idToken);
            email = claims.getStringClaimValue("email");
            emailVerified = claims.getClaimValue("email_verified");
            name = claims.getStringClaimValue("name");
            subject = claims.getSubject();
        } catch (Exception e) {
            throw new BadCredentialsException("Jeton Google invalide ou expiré.");
        }
        boolean verified = Boolean.TRUE.equals(emailVerified) || "true".equals(String.valueOf(emailVerified));
        if (email == null || email.isBlank() || !verified) {
            throw new BadCredentialsException("Adresse Google non vérifiée.");
        }
        return new GoogleIdentity(email.trim(), name, subject);
    }
}
