package com.classroom.backend.service;

import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.Student;
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

    public record ParentAccountResult(AppUser user, boolean newlyCreated) {}

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailNotificationService emailNotificationService;
    private final SchoolEmailService schoolEmailService;
    private final AccountIdentifierService accountIdentifierService;
    private final SchoolContextService schoolContextService;
    private final UserEmailAuthService userEmailAuthService;

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

        if (requiresPortalAccount(role) && !hasEmail && !hasPhone) {
            throw new IllegalArgumentException(
                    "L'e-mail ou le téléphone de contact est requis pour créer ce compte portail.");
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
        String rawPassword = java.util.UUID.randomUUID().toString();
        boolean portalAccount = requiresPortalAccount(role);

        AppUser user = AppUser.builder()
                .name(name)
                .loginId(loginId)
                .email(contactEmail)
                .phone(normalizedPhone)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .schoolId(schoolContextService.getCurrentSchoolId().orElse(null))
                .emailVerified(!hasEmail || !isRealContactEmail(contactEmail))
                .passwordSetupRequired(portalAccount)
                .build();
        AppUser saved = appUserRepository.save(user);

        boolean inviteByEmail = portalAccount
                && hasEmail
                && isRealContactEmail(contactEmail)
                && (password == null || password.isBlank());

        if (inviteByEmail) {
            String invitationToken = userEmailAuthService.issueInvitationToken(saved);
            emailNotificationService.sendPortalInvitation(
                    name, contactEmail, loginId, role, invitationToken);
        } else if (hasEmail && isRealContactEmail(contactEmail)) {
            if (password != null && !password.isBlank()) {
                emailNotificationService.sendPortalCredentials(
                        name, contactEmail, loginId, password, role);
            } else {
                emailNotificationService.sendPortalCredentials(
                        name, contactEmail, loginId, null, role);
            }
            userEmailAuthService.sendVerificationEmail(saved);
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
    public ParentAccountResult findOrCreateParentAccount(
            String firstName,
            String lastName,
            String name,
            String email,
            String phone,
            String password
    ) {
        return findOrCreateParentAccount(firstName, lastName, name, email, phone, password, null);
    }

    /**
     * Same, for a parent linked to {@code child}. A child is often registered with the parent's
     * e-mail or phone: when that contact is on the child's own account, it moves to the parent
     * (who then receives the invitation) and the child keeps signing in with their login id.
     */
    @Transactional
    public ParentAccountResult findOrCreateParentAccount(
            String firstName,
            String lastName,
            String name,
            String email,
            String phone,
            String password,
            Student child
    ) {
        boolean hasEmail = email != null && !email.isBlank();
        boolean hasPhone = phone != null && !phone.isBlank();

        String normalizedPhone = hasPhone ? PhoneAccountUtil.normalizePhone(phone) : null;
        if (normalizedPhone != null && !normalizedPhone.isBlank()) {
            var byPhone = appUserRepository.findByPhone(normalizedPhone);
            if (byPhone.isPresent()) {
                AppUser existing = byPhone.get();
                if (isAccountOf(existing, child)) {
                    existing.setPhone(null);
                    appUserRepository.saveAndFlush(existing);
                } else if (existing.getRole() != UserRole.PARENT) {
                    throw new IllegalArgumentException("Ce téléphone est déjà utilisé par un autre type de compte");
                } else {
                    existing.setName(PersonNameUtil.resolveFullName(firstName, lastName, name));
                    appUserRepository.save(existing);
                    return new ParentAccountResult(existing, false);
                }
            }
        }

        if (hasEmail) {
            String contactEmail = email.trim();
            var byEmail = appUserRepository.findByEmailIgnoreCase(contactEmail);
            if (byEmail.isPresent()) {
                AppUser existing = byEmail.get();
                if (isAccountOf(existing, child)) {
                    existing.setEmail(childPortalEmail(existing));
                    existing.setEmailVerified(true);
                    appUserRepository.saveAndFlush(existing);
                } else if (existing.getRole() != UserRole.PARENT) {
                    throw new IllegalArgumentException(
                            "Cet e-mail est déjà utilisé par un autre compte. Choisissez l'élève concerné pour le lui rattacher, ou utilisez un autre e-mail.");
                } else {
                    existing.setName(PersonNameUtil.resolveFullName(firstName, lastName, name));
                    appUserRepository.save(existing);
                    return new ParentAccountResult(existing, false);
                }
            }
        }

        AppUser created = createLinkedAccountForPerson(
                firstName, lastName, name, email, phone, password, UserRole.PARENT);
        return new ParentAccountResult(created, true);
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
            user.setPasswordSetupRequired(false);
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

    @Transactional
    public void resendPortalInvitation(String userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Compte introuvable."));
        schoolContextService.assertSchoolAccess(user.getSchoolId());
        if (!user.isPasswordSetupRequired()) {
            throw new IllegalStateException("Ce compte est déjà activé.");
        }
        if (!isRealContactEmail(user.getEmail())) {
            throw new IllegalArgumentException("Aucune adresse e-mail valide pour renvoyer l'invitation.");
        }
        String token = userEmailAuthService.issueInvitationToken(user);
        emailNotificationService.sendPortalInvitation(
                user.getName(), user.getEmail(), user.getLoginId(), user.getRole(), token);
    }

    public String resolveLoginEmail(String identifier) {
        AppUser user = accountIdentifierService.requireBySignInIdentifier(identifier);
        return user.getEmail();
    }

    private static boolean requiresPortalAccount(UserRole role) {
        return role == UserRole.STUDENT || role == UserRole.TEACHER || role == UserRole.PARENT;
    }

    /**
     * Before giving {@code email}/{@code phone} to a parent of {@code child}: if the child's own
     * account holds them, the child keeps an internal address and signs in with their login id.
     */
    @Transactional
    public void releaseChildContact(Student child, String email, String phone) {
        if (child == null || child.getAppUser() == null) return;
        AppUser account = appUserRepository.findById(child.getAppUser().getId()).orElse(null);
        if (account == null || account.getRole() != UserRole.STUDENT) return;
        boolean changed = false;
        if (email != null && !email.isBlank() && email.trim().equalsIgnoreCase(account.getEmail())) {
            account.setEmail(childPortalEmail(account));
            account.setEmailVerified(true);
            changed = true;
        }
        if (phone != null && !phone.isBlank()
                && PhoneAccountUtil.normalizePhone(phone).equals(account.getPhone())) {
            account.setPhone(null);
            changed = true;
        }
        if (changed) appUserRepository.saveAndFlush(account);
    }

    /** True when {@code user} is the portal account of {@code child}. */
    private static boolean isAccountOf(AppUser user, Student child) {
        return child != null
                && child.getAppUser() != null
                && user.getRole() == UserRole.STUDENT
                && user.getId() != null
                && user.getId().equals(child.getAppUser().getId());
    }

    /** Internal address for a child account whose real e-mail now belongs to the parent. */
    private String childPortalEmail(AppUser child) {
        String base = child.getLoginId() != null && !child.getLoginId().isBlank() ? child.getLoginId() : child.getId();
        String candidate = "eleve." + base.toLowerCase().replaceAll("[^a-z0-9._-]", "") + "@portal.classroom";
        int n = 2;
        while (appUserRepository.existsByEmailIgnoreCase(candidate)) {
            candidate = "eleve." + base.toLowerCase().replaceAll("[^a-z0-9._-]", "") + "." + n++ + "@portal.classroom";
        }
        return candidate;
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
