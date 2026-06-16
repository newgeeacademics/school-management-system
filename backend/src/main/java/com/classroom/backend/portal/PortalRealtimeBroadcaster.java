package com.classroom.backend.portal;

import com.classroom.backend.dto.response.PortalChatResponse.PortalChatMessageDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class PortalRealtimeBroadcaster {

    private final ObjectMapper objectMapper;
    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();
    private final Map<String, PortalSection> activeSectionBySession = new ConcurrentHashMap<>();

    public void register(WebSocketSession session) {
        sessions.add(session);
        activeSectionBySession.put(session.getId(), PortalSection.OVERVIEW);
    }

    public void unregister(WebSocketSession session) {
        sessions.remove(session);
        activeSectionBySession.remove(session.getId());
    }

    public void setActiveSection(WebSocketSession session, PortalSection section) {
        activeSectionBySession.put(session.getId(), section);
    }

    public void broadcastRefresh(PortalSection section) {
        PortalWsMessage payload = PortalWsMessage.builder()
                .type("REFRESH")
                .section(section.name().toLowerCase())
                .build();
        broadcast(payload);
    }

    public void broadcastChatMessage(PortalChatMessageDto chatMessage) {
        if (chatMessage == null) {
            return;
        }
        PortalWsMessage payload = PortalWsMessage.builder()
                .type("CHAT")
                .section("messages")
                .id(chatMessage.getId())
                .senderUserId(chatMessage.getSenderUserId())
                .senderName(chatMessage.getSenderName())
                .senderRole(chatMessage.getSenderRole())
                .body(chatMessage.getBody())
                .sentAt(chatMessage.getSentAt())
                .build();
        broadcast(payload);
    }

    public void broadcastLocationUpdate(String routeId, double lat, double lng, java.time.Instant recordedAt) {
        PortalWsMessage payload = PortalWsMessage.builder()
                .type("LOCATION_UPDATE")
                .section("transport")
                .routeId(routeId)
                .lat(lat)
                .lng(lng)
                .recordedAt(recordedAt != null ? recordedAt.toString() : null)
                .build();
        broadcast(payload);
    }

    public void sendNavigate(WebSocketSession session, PortalSection section) {
        PortalWsMessage payload = PortalWsMessage.builder()
                .type("NAVIGATE")
                .section(section.name().toLowerCase())
                .build();
        send(session, payload);
    }

    public void sendAck(WebSocketSession session, String type, PortalSection section) {
        PortalWsMessage payload = PortalWsMessage.builder()
                .type(type)
                .section(section.name().toLowerCase())
                .message("ok")
                .build();
        send(session, payload);
    }

    public void broadcast(PortalWsMessage message) {
        sessions.forEach(session -> send(session, message));
    }

    private void send(WebSocketSession session, PortalWsMessage message) {
        if (session == null || !session.isOpen()) {
            return;
        }
        try {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
        } catch (Exception ex) {
            log.warn("Failed to send WebSocket message to {}: {}", session.getId(), ex.getMessage());
        }
    }
}
