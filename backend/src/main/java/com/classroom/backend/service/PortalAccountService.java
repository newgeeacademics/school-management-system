package com.classroom.backend.service;

import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.AppUserRepository;
import com.classroom.backend.service.email.EmailNotificationService;
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

    /** Creates a portal login when email is provided. Password defaults to {@code changeme}. */
    @Transactional
    public AppUser createLinkedAccount(String name, String email, String password, UserRole role) {
        if (email == null || email.isBlank()) {
            return null;
        }
        String normalized = email.trim();
        if (appUserRepository.existsByEmail(normalized)) {
            throw new IllegalArgumentException("Email already in use: " + normalized);
        }
        String rawPassword = (password != null && !password.isBlank()) ? password : "changeme";
        AppUser user = AppUser.builder()
                .name(name)
                .email(normalized)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .build();
        AppUser saved = appUserRepository.save(user);
        emailNotificationService.sendPortalCredentials(name, normalized, rawPassword, role);
        return saved;
    }

    @Transactional
    public void syncLinkedAccount(AppUser user, String name, String email, String password) {
        if (user == null) {
            return;
        }
        user.setName(name);
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
            if (user.getEmail() != null && !user.getEmail().isBlank()) {
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
}
