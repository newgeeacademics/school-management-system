package com.classroom.backend.service;

import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.AppUserRepository;
import com.classroom.backend.service.email.EmailNotificationService;
import com.classroom.backend.util.PhoneAccountUtil;
import com.classroom.backend.util.PersonNameUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PortalAccountService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailNotificationService emailNotificationService;

    /** Creates a portal login when email and/or phone is provided. */
    @Transactional
    public AppUser createLinkedAccount(
            String name, String email, String phone, String password, UserRole role
    ) {
        boolean hasEmail = email != null && !email.isBlank();
        boolean hasPhone = phone != null && !phone.isBlank();
        if (!hasEmail && !hasPhone) {
            return null;
        }

        String normalizedPhone = hasPhone ? PhoneAccountUtil.normalizePhone(phone) : null;
        if (normalizedPhone != null && !normalizedPhone.isBlank()
                && appUserRepository.existsByPhone(normalizedPhone)) {
            throw new IllegalArgumentException("Phone already in use: " + normalizedPhone);
        }

        String loginEmail;
        if (hasEmail) {
            loginEmail = email.trim();
        } else {
            loginEmail = PhoneAccountUtil.syntheticEmailForPhone(normalizedPhone);
        }

        if (appUserRepository.existsByEmail(loginEmail)) {
            throw new IllegalArgumentException("Account already exists for: " + loginEmail);
        }

        String rawPassword = (password != null && !password.isBlank()) ? password : "changeme";
        AppUser user = AppUser.builder()
                .name(name)
                .email(loginEmail)
                .phone(normalizedPhone)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .build();
        AppUser saved = appUserRepository.save(user);

        if (hasEmail) {
            emailNotificationService.sendPortalCredentials(name, loginEmail, rawPassword, role);
        }

        return saved;
    }

    /**
     * Reuses an existing PARENT portal account when email/phone matches,
     * so one parent can be linked to multiple children.
     */
    @Transactional
    public AppUser findOrCreateParentAccount(
            String name, String email, String phone, String password
    ) {
        boolean hasEmail = email != null && !email.isBlank();
        boolean hasPhone = phone != null && !phone.isBlank();
        if (!hasEmail && !hasPhone) {
            return null;
        }

        String normalizedPhone = hasPhone ? PhoneAccountUtil.normalizePhone(phone) : null;
        if (normalizedPhone != null && !normalizedPhone.isBlank()) {
            var byPhone = appUserRepository.findByPhone(normalizedPhone);
            if (byPhone.isPresent()) {
                AppUser existing = byPhone.get();
                if (existing.getRole() != UserRole.PARENT) {
                    throw new IllegalArgumentException("Ce téléphone est déjà utilisé par un autre type de compte");
                }
                existing.setName(PersonNameUtil.resolveFullName(null, null, name));
                appUserRepository.save(existing);
                return existing;
            }
        }

        String loginEmail = hasEmail ? email.trim() : PhoneAccountUtil.syntheticEmailForPhone(normalizedPhone);
        var byEmail = appUserRepository.findByEmailIgnoreCase(loginEmail);
        if (byEmail.isPresent()) {
            AppUser existing = byEmail.get();
            if (existing.getRole() != UserRole.PARENT) {
                throw new IllegalArgumentException("Cet e-mail est déjà utilisé par un autre type de compte");
            }
            existing.setName(PersonNameUtil.resolveFullName(null, null, name));
            appUserRepository.save(existing);
            return existing;
        }

        return createLinkedAccount(name, email, phone, password, UserRole.PARENT);
    }

    @Transactional
    public void syncLinkedAccount(AppUser user, String name, String email, String phone, String password) {
        if (user == null) {
            return;
        }
        user.setName(name);

        if (phone != null && !phone.isBlank()) {
            String normalizedPhone = PhoneAccountUtil.normalizePhone(phone);
            if (!normalizedPhone.equals(user.getPhone()) && appUserRepository.existsByPhone(normalizedPhone)) {
                throw new IllegalArgumentException("Phone already in use: " + normalizedPhone);
            }
            user.setPhone(normalizedPhone);
        }

        if (email != null && !email.isBlank()) {
            String normalized = email.trim();
            if (!normalized.equalsIgnoreCase(user.getEmail()) && appUserRepository.existsByEmail(normalized)) {
                throw new IllegalArgumentException("Email already in use: " + normalized);
            }
            user.setEmail(normalized);
        }

        if (password != null && !password.isBlank()) {
            user.setPassword(passwordEncoder.encode(password));
            appUserRepository.save(user);
            if (user.getEmail() != null && !user.getEmail().contains("@portal.classroom")) {
                emailNotificationService.sendPortalCredentials(
                        user.getName(), user.getEmail(), password, user.getRole());
            }
            return;
        }
        appUserRepository.save(user);
    }

    @Transactional
    public void deleteLinkedAccount(AppUser user) {
        if (user != null) {
            appUserRepository.delete(user);
        }
    }

    public String resolveLoginEmail(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("Identifiant requis");
        }
        String trimmed = identifier.trim();
        if (PhoneAccountUtil.looksLikePhone(trimmed)) {
            String phone = PhoneAccountUtil.normalizePhone(trimmed);
            return appUserRepository.findByPhone(phone)
                    .map(AppUser::getEmail)
                    .orElseThrow(() -> new RuntimeException("Aucun compte pour ce numéro"));
        }
        return trimmed;
    }
}
