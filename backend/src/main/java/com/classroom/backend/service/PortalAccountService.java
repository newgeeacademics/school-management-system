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
    private final SchoolEmailService schoolEmailService;
    private final AccountIdentifierService accountIdentifierService;

    /**
     * Creates a portal account with a short login id (e.g. sermem1) and a real contact email
     * for teachers, parents, and students.
     */
    @Transactional
    public AppUser createLinkedAccountForPerson(
            String firstName,
            String lastName,
            String name,
            String email,
            String phone,
            String password,
            UserRole role
    ) {
        boolean hasEmail = email != null && !email.isBlank();
        boolean hasPhone = phone != null && !phone.isBlank();

        if (requiresContactEmail(role) && !hasEmail) {
            throw new IllegalArgumentException(
                    "L'e-mail de contact est requis pour créer ce compte portail.");
        }
        if (hasEmail && !isRealContactEmail(email)) {
            throw new IllegalArgumentException("Adresse e-mail de contact invalide.");
        }

        String normalizedPhone = hasPhone ? PhoneAccountUtil.normalizePhone(phone) : null;
        if (normalizedPhone != null && !normalizedPhone.isBlank()
                && appUserRepository.existsByPhone(normalizedPhone)) {
            throw new IllegalArgumentException("Phone already in use: " + normalizedPhone);
        }

        String contactEmail;
        if (hasEmail) {
            contactEmail = email.trim();
        } else if (normalizedPhone != null && !normalizedPhone.isBlank()) {
            contactEmail = PhoneAccountUtil.syntheticEmailForPhone(normalizedPhone);
        } else {
            throw new IllegalArgumentException("E-mail ou téléphone requis pour créer le compte.");
        }

        if (appUserRepository.existsByEmailIgnoreCase(contactEmail)) {
            throw new IllegalArgumentException("Account already exists for: " + contactEmail);
        }

        String loginId = schoolEmailService.generateUniqueLoginId(firstName, lastName);
        String rawPassword = (password != null && !password.isBlank()) ? password : "changeme";

        AppUser user = AppUser.builder()
                .name(name)
                .loginId(loginId)
                .email(contactEmail)
                .phone(normalizedPhone)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .build();
        AppUser saved = appUserRepository.save(user);

        if (hasEmail && isRealContactEmail(contactEmail)) {
            emailNotificationService.sendPortalCredentials(
                    name, contactEmail, loginId, rawPassword, role);
        }

        return saved;
    }

    @Transactional
    public AppUser createLinkedAccount(
            String name, String email, String phone, String password, UserRole role
    ) {
        String[] parts = name != null ? name.trim().split("\\s+", 2) : new String[0];
        String firstName = parts.length > 0 ? parts[0] : name;
        String lastName = parts.length > 1 ? parts[1] : "";
        return createLinkedAccountForPerson(firstName, lastName, name, email, phone, password, role);
    }

    @Transactional
    public AppUser findOrCreateParentAccount(
            String firstName,
            String lastName,
            String name,
            String email,
            String phone,
            String password
    ) {
        boolean hasEmail = email != null && !email.isBlank();
        boolean hasPhone = phone != null && !phone.isBlank();

        String normalizedPhone = hasPhone ? PhoneAccountUtil.normalizePhone(phone) : null;
        if (normalizedPhone != null && !normalizedPhone.isBlank()) {
            var byPhone = appUserRepository.findByPhone(normalizedPhone);
            if (byPhone.isPresent()) {
                AppUser existing = byPhone.get();
                if (existing.getRole() != UserRole.PARENT) {
                    throw new IllegalArgumentException("Ce téléphone est déjà utilisé par un autre type de compte");
                }
                existing.setName(PersonNameUtil.resolveFullName(firstName, lastName, name));
                appUserRepository.save(existing);
                return existing;
            }
        }

        if (hasEmail) {
            String contactEmail = email.trim();
            var byEmail = appUserRepository.findByEmailIgnoreCase(contactEmail);
            if (byEmail.isPresent()) {
                AppUser existing = byEmail.get();
                if (existing.getRole() != UserRole.PARENT) {
                    throw new IllegalArgumentException("Cet e-mail est déjà utilisé par un autre type de compte");
                }
                existing.setName(PersonNameUtil.resolveFullName(firstName, lastName, name));
                appUserRepository.save(existing);
                return existing;
            }
        }

        return createLinkedAccountForPerson(
                firstName, lastName, name, email, phone, password, UserRole.PARENT);
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
            if (!normalized.equalsIgnoreCase(user.getEmail())
                    && appUserRepository.existsByEmailIgnoreCase(normalized)) {
                throw new IllegalArgumentException("Email already in use: " + normalized);
            }
            user.setEmail(normalized);
        }

        if (password != null && !password.isBlank()) {
            user.setPassword(passwordEncoder.encode(password));
            appUserRepository.save(user);
            if (user.getEmail() != null && isRealContactEmail(user.getEmail())) {
                emailNotificationService.sendPortalCredentials(
                        user.getName(),
                        user.getEmail(),
                        user.getLoginId(),
                        password,
                        user.getRole());
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
        AppUser user = accountIdentifierService.requireBySignInIdentifier(identifier);
        return user.getEmail();
    }

    private static boolean requiresContactEmail(UserRole role) {
        return role == UserRole.STUDENT || role == UserRole.TEACHER || role == UserRole.PARENT;
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
}
