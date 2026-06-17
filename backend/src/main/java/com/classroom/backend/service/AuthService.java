package com.classroom.backend.service;

import com.classroom.backend.dto.auth.AuthResponse;
import com.classroom.backend.dto.auth.LoginRequest;
import com.classroom.backend.dto.auth.RegisterSchoolRequest;
import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.School;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.AppUserRepository;
import com.classroom.backend.security.JwtTokenProvider;
import com.classroom.backend.service.email.EmailNotificationService;
import com.classroom.backend.util.PhoneAccountUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                .build();
        user = appUserRepository.save(user);

        School school = schoolService.create(request.getSchool());
        user.setSchoolId(school.getId());
        user = appUserRepository.save(user);

        String token = issueToken(user.getEmail(), request.getPassword());

        emailNotificationService.sendSchoolWelcome(user.getName(), user.getEmail());

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
                .build();
    }
}
