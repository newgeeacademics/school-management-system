package com.classroom.backend.service;

import com.classroom.backend.dto.response.PortalChatResponse.PortalChatMessageDto;
import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.PortalChatMessage;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.portal.PortalRealtimeBroadcaster;
import com.classroom.backend.repository.AppUserRepository;
import com.classroom.backend.repository.PortalChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PortalChatService {

    private static final int MAX_BODY_LENGTH = 2000;
    private static final String DEFAULT_SCHOOL_KEY = "default";

    private final PortalChatMessageRepository chatMessageRepository;
    private final PortalScopeResolver scopeResolver;
    private final AppUserRepository appUserRepository;
    private final AccountIdentifierService accountIdentifierService;
    private final PortalRealtimeBroadcaster broadcaster;

    @Transactional(readOnly = true)
    public List<PortalChatMessageDto> getRecentMessages() {
        String schoolKey = resolveSchoolKey(scopeResolver.resolveForCurrentUser().user());
        List<PortalChatMessage> rows = new ArrayList<>(
                chatMessageRepository.findTop100BySchoolKeyOrderBySentAtDesc(schoolKey)
        );
        Collections.reverse(rows);
        return rows.stream().map(this::toDto).toList();
    }

    @Transactional
    public PortalChatMessageDto sendMessage(String body) {
        return sendMessageFromUser(scopeResolver.resolveForCurrentUser().user(), body);
    }

    @Transactional
    public PortalChatMessageDto sendMessageFromEmail(String principal, String body) {
        AppUser user = accountIdentifierService.findByPrincipalName(principal)
                .or(() -> accountIdentifierService.findBySignInIdentifier(principal))
                .orElseThrow(() -> new IllegalStateException("User not found"));
        assertPortalRole(user.getRole());
        return sendMessageFromUser(user, body);
    }

    private PortalChatMessageDto sendMessageFromUser(AppUser user, String body) {
        assertPortalRole(user.getRole());
        String trimmed = body == null ? "" : body.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Le message ne peut pas être vide.");
        }
        if (trimmed.length() > MAX_BODY_LENGTH) {
            throw new IllegalArgumentException("Le message est trop long (max " + MAX_BODY_LENGTH + " caractères).");
        }

        PortalChatMessage saved = chatMessageRepository.save(PortalChatMessage.builder()
                .schoolKey(resolveSchoolKey(user))
                .senderUserId(user.getId())
                .senderName(user.getName())
                .senderRole(user.getRole())
                .body(trimmed)
                .sentAt(Instant.now())
                .build());

        PortalChatMessageDto dto = toDto(saved);
        broadcaster.broadcastChatMessage(dto);
        return dto;
    }

    private void assertPortalRole(UserRole role) {
        if (role != UserRole.TEACHER && role != UserRole.STUDENT && role != UserRole.PARENT) {
            throw new IllegalStateException("Le chat portail n'est pas disponible pour ce rôle.");
        }
    }

    private String resolveSchoolKey(AppUser user) {
        if (user.getSchoolId() != null && !user.getSchoolId().isBlank()) {
            return user.getSchoolId();
        }
        return DEFAULT_SCHOOL_KEY;
    }

    private PortalChatMessageDto toDto(PortalChatMessage message) {
        return PortalChatMessageDto.builder()
                .id(message.getId())
                .senderUserId(message.getSenderUserId())
                .senderName(message.getSenderName())
                .senderRole(message.getSenderRole().name())
                .body(message.getBody())
                .sentAt(message.getSentAt() != null ? message.getSentAt().toString() : null)
                .build();
    }
}
