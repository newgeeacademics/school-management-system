package com.classroom.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "push_subscriptions",
        uniqueConstraints = @UniqueConstraint(columnNames = "endpoint")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PushSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "app_user_id", nullable = false)
    private String appUserId;

    @Column(nullable = false, length = 2048)
    private String endpoint;

    @Column(name = "p256dh", nullable = false, length = 512)
    private String p256dh;

    @Column(name = "auth_key", nullable = false, length = 512)
    private String authKey;

    @Column(updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
