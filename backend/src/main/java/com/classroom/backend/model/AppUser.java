package com.classroom.backend.model;

import com.classroom.backend.model.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "app_users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    /** Short portal sign-in id (e.g. sermem1). Contact email is stored separately in {@link #email}. */
    @Column(name = "login_id", unique = true)
    private String loginId;

    @Column(unique = true)
    private String phone;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    /** School this account administers (set when registering an establishment). */
    @Column(name = "school_id")
    private String schoolId;

    /** False until the user clicks the verification link (existing rows default true). */
    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private boolean emailVerified = true;

    @Column(name = "email_verify_token")
    @JsonIgnore
    private String emailVerifyToken;

    @Column(name = "email_verify_expires_at")
    @JsonIgnore
    private Instant emailVerifyExpiresAt;

    @Column(name = "password_reset_token")
    @JsonIgnore
    private String passwordResetToken;

    @Column(name = "password_reset_expires_at")
    @JsonIgnore
    private Instant passwordResetExpiresAt;

    /** True until the user sets their password on first portal login. */
    @Column(name = "password_setup_required", nullable = false)
    @Builder.Default
    private boolean passwordSetupRequired = false;
}
