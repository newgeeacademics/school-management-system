# Sign in with Google

The classroom app (`/login`) now has a **Continue with Google** button. It uses
[Google Identity Services](https://developers.google.com/identity/gsi/web): the
browser gets a signed Google **ID token**, sends it to the API, and the API
verifies it and returns the usual NewGee session (same JSON as `/api/auth/login`).

Google only proves *who* the person is. Access still comes from NewGee: the
Google e-mail must match an existing account (accounts are still provisioned by
the school). No account is created automatically.

```
Browser ──(Google popup)──▶ Google ──ID token──▶ Browser
Browser ──POST /api/auth/google { idToken }──▶ API ──verify signature/aud/exp──▶ AuthResponse (JWT)
```

## 1. Google Cloud Console (once)

1. **APIs & Services → OAuth consent screen**: set app name *NewGee*, support
   e-mail and logo, then publish it.
2. **Credentials → Create credentials → OAuth client ID → Web application**.
3. **Authorized JavaScript origins**: add every site that shows the button, e.g.
   - `https://www.newgeeacademy.com`
   - `https://portal.newgeeacademy.com` (when the portal gets the button)
   - `http://localhost:5173` (local dev)
   No redirect URI is needed (popup mode).
4. Copy the **client ID** (`…apps.googleusercontent.com`).

## 2. Frontend (this app, Vercel)

Set `VITE_GOOGLE_CLIENT_ID=<client id>` on the Vercel project and redeploy.
Without it the button is simply hidden, so it is safe to deploy first.

## 3. Backend (Render, branch `it`, folder `backend/`) — required

The frontend calls `POST /api/auth/google`, which does not exist yet. Add it
there (this branch only contains the frontend). `jose4j` is already in
`pom.xml`, and `/api/auth/**` is already `permitAll()` in `SecurityConfig`.

Set on Render: `GOOGLE_CLIENT_ID=<same client id>` (comma-separate several if
the mobile app uses its own client ID).

**`application.yml`** (under `app:`)

```yaml
  google:
    client-ids: ${GOOGLE_CLIENT_ID:}
```

**`dto/auth/GoogleLoginRequest.java`**

```java
package com.classroom.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {
    @NotBlank
    private String idToken;
}
```

**`security/GoogleIdTokenVerifier.java`**

```java
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

/** Verifies Google Identity Services ID tokens (signature, issuer, audience, expiry). */
@Component
public class GoogleIdTokenVerifier {

    public record GoogleIdentity(String email, String name, String subject) {}

    private final String[] clientIds;
    private final HttpsJwksVerificationKeyResolver keyResolver =
            new HttpsJwksVerificationKeyResolver(new HttpsJwks("https://www.googleapis.com/oauth2/v3/certs"));

    public GoogleIdTokenVerifier(@Value("${app.google.client-ids:}") String clientIds) {
        this.clientIds = Arrays.stream(clientIds.split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toArray(String[]::new);
    }

    public boolean isConfigured() {
        return clientIds.length > 0;
    }

    public GoogleIdentity verify(String idToken) {
        if (!isConfigured()) {
            throw new IllegalStateException("Connexion Google non configurée (GOOGLE_CLIENT_ID).");
        }
        JwtConsumer consumer = new JwtConsumerBuilder()
                .setVerificationKeyResolver(keyResolver)
                .setExpectedIssuers(true, "https://accounts.google.com", "accounts.google.com")
                .setExpectedAudience(clientIds)
                .setRequireExpirationTime()
                .setRequireSubject()
                .setAllowedClockSkewInSeconds(60)
                .build();
        try {
            JwtClaims claims = consumer.processToClaims(idToken);
            Object verified = claims.getClaimValue("email_verified");
            String email = claims.getStringClaimValue("email");
            if (email == null || !(Boolean.TRUE.equals(verified) || "true".equals(String.valueOf(verified)))) {
                throw new BadCredentialsException("Adresse Google non vérifiée.");
            }
            String name = claims.getStringClaimValue("name");
            return new GoogleIdentity(email.trim(), name, claims.getSubject());
        } catch (BadCredentialsException e) {
            throw e;
        } catch (Exception e) {
            throw new BadCredentialsException("Jeton Google invalide ou expiré.");
        }
    }
}
```

**`AuthService.java`** — inject `GoogleIdTokenVerifier googleIdTokenVerifier` and add:

```java
    public AuthResponse loginWithGoogle(String idToken) {
        GoogleIdTokenVerifier.GoogleIdentity google = googleIdTokenVerifier.verify(idToken);
        AppUser user = appUserRepository.findByEmailIgnoreCase(google.email())
                .orElseThrow(() -> new BadCredentialsException(
                        "Aucun compte NewGee n'est associé à " + google.email() + "."));

        // Google has just proven ownership of this address.
        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
            user = appUserRepository.save(user);
        }

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
```

**`AuthController.java`**

```java
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request.getIdToken()));
    }
```

Make sure `GlobalExceptionHandler` maps `BadCredentialsException` to **401**
with `{ "error": "…" }` (the frontend shows that message).

## 4. Other apps (admin, user portal, finance, tracking)

They live on their own deploy branches and in the `it` monorepo, so they are
not in this branch. Once the endpoint above exists they can reuse the same
pieces unchanged:

- `src/lib/google-auth.ts` (script loader)
- `src/components/auth/GoogleSignInButton.tsx` (button)
- a `loginWithGoogle(idToken)` call to `POST /api/auth/google`, then the app's
  existing "save session" code, exactly as `sign-in-form.tsx` does here.

Each app only needs its origin added to the OAuth client and
`VITE_GOOGLE_CLIENT_ID` set on its Vercel project. The role check stays
per-app (console = `ADMIN`, portal = student/parent/teacher, …).
