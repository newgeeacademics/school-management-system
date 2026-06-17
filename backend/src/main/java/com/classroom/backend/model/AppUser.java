package com.classroom.backend.model;

import com.classroom.backend.model.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

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
}
