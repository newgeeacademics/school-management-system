package com.classroom.backend.service;

import com.classroom.backend.model.AppUser;
import com.classroom.backend.repository.AppUserRepository;
import com.classroom.backend.util.PhoneAccountUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccountIdentifierService {

    private final AppUserRepository appUserRepository;

    /** Principal stored in JWT / Spring Security (login id when set, else email). */
    public String canonicalPrincipalName(AppUser user) {
        if (user.getLoginId() != null && !user.getLoginId().isBlank()) {
            return user.getLoginId().trim();
        }
        return user.getEmail();
    }

    public AppUser requireByPrincipalName(String principal) {
        return findByPrincipalName(principal)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    public java.util.Optional<AppUser> findByPrincipalName(String principal) {
        if (principal == null || principal.isBlank()) {
            return java.util.Optional.empty();
        }
        String trimmed = principal.trim();
        return appUserRepository.findByLoginIdIgnoreCase(trimmed)
                .or(() -> appUserRepository.findByEmail(trimmed))
                .or(() -> appUserRepository.findByEmailIgnoreCase(trimmed));
    }

    /** Resolves sign-in input: portal login id, contact email, or phone number. */
    public AppUser requireBySignInIdentifier(String identifier) {
        return findBySignInIdentifier(identifier)
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException(
                        "Identifiants invalides"));
    }

    public java.util.Optional<AppUser> findBySignInIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return java.util.Optional.empty();
        }
        String trimmed = identifier.trim();
        if (PhoneAccountUtil.looksLikePhone(trimmed)) {
            String phone = PhoneAccountUtil.normalizePhone(trimmed);
            return appUserRepository.findByPhone(phone);
        }
        if (trimmed.contains("@")) {
            return appUserRepository.findByEmailIgnoreCase(trimmed);
        }
        return appUserRepository.findByLoginIdIgnoreCase(trimmed)
                .or(() -> appUserRepository.findByEmailIgnoreCase(trimmed));
    }
}
