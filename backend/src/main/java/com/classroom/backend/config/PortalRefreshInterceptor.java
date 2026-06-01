package com.classroom.backend.config;

import com.classroom.backend.portal.PortalRealtimeBroadcaster;
import com.classroom.backend.portal.PortalSection;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class PortalRefreshInterceptor implements HandlerInterceptor {

    private final PortalRealtimeBroadcaster broadcaster;

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        if (ex != null || response.getStatus() >= 400) {
            return;
        }
        String method = request.getMethod();
        if (!("POST".equals(method) || "PUT".equals(method) || "PATCH".equals(method) || "DELETE".equals(method))) {
            return;
        }
        String uri = request.getRequestURI();
        if (!uri.startsWith("/api/") || uri.startsWith("/api/auth/")) {
            return;
        }
        broadcaster.broadcastRefresh(PortalSection.fromPath(uri));
    }
}
