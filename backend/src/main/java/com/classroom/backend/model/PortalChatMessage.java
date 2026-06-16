package com.classroom.backend.model;

import com.classroom.backend.model.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "portal_chat_messages",
        indexes = @Index(name = "idx_portal_chat_school_sent", columnList = "school_key,sent_at")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortalChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "school_key", nullable = false)
    private String schoolKey;

    @Column(name = "sender_user_id", nullable = false)
    private String senderUserId;

    @Column(nullable = false)
    private String senderName;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_role", nullable = false)
    private UserRole senderRole;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false)
    private Instant sentAt;
}
