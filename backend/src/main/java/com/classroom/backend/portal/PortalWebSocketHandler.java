package com.classroom.backend.portal;

import com.classroom.backend.service.PortalChatService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
@RequiredArgsConstructor
@Slf4j
public class PortalWebSocketHandler extends TextWebSocketHandler {

    private final PortalRealtimeBroadcaster broadcaster;
    private final ObjectMapper objectMapper;
    private final PortalChatService portalChatService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        broadcaster.register(session);
        broadcaster.sendAck(session, "CONNECTED", PortalSection.OVERVIEW);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        broadcaster.unregister(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            JsonNode root = objectMapper.readTree(message.getPayload());
            String type = root.path("type").asText("").toUpperCase();
            PortalSection section = PortalSection.fromClientValue(root.path("section").asText(null));

            switch (type) {
                case "PING" -> broadcaster.sendAck(session, "PONG", section);
                case "NAVIGATE" -> {
                    broadcaster.setActiveSection(session, section);
                    broadcaster.sendNavigate(session, section);
                }
                case "SUBSCRIBE" -> {
                    broadcaster.setActiveSection(session, section);
                    broadcaster.sendAck(session, "SUBSCRIBED", section);
                }
                case "CHAT" -> {
                    String body = root.path("body").asText("");
                    String username = (String) session.getAttributes().get("username");
                    if (StringUtils.hasText(username) && StringUtils.hasText(body)) {
                        try {
                            portalChatService.sendMessageFromEmail(username, body);
                        } catch (Exception ex) {
                            log.debug("Chat message rejected for {}: {}", username, ex.getMessage());
                        }
                    }
                }
                default -> broadcaster.sendAck(session, "ACK", section);
            }
        } catch (Exception ex) {
            log.debug("Invalid WebSocket payload from {}: {}", session.getId(), ex.getMessage());
        }
    }
}
