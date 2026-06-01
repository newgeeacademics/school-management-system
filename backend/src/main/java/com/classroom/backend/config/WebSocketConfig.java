package com.classroom.backend.config;

import com.classroom.backend.portal.JwtHandshakeInterceptor;
import com.classroom.backend.portal.PortalWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final PortalWebSocketHandler portalWebSocketHandler;
    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    private String[] resolveAllowedOriginPatterns() {
        List<String> patterns = new ArrayList<>();
        patterns.add("http://localhost:*");
        patterns.add("https://*.vercel.app");
        if (allowedOrigins != null && !allowedOrigins.isBlank()) {
            Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .forEach(patterns::add);
        }
        return patterns.toArray(String[]::new);
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(portalWebSocketHandler, "/ws/portal")
                .addInterceptors(jwtHandshakeInterceptor)
                .setAllowedOriginPatterns(resolveAllowedOriginPatterns());
    }
}
