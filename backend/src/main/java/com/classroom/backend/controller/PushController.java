package com.classroom.backend.controller;

import com.classroom.backend.dto.request.PushSubscribeRequest;
import com.classroom.backend.model.AppUser;
import com.classroom.backend.service.AccountIdentifierService;
import com.classroom.backend.service.WebPushService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Web Push for user portal, tracking app, and any authenticated app user. */
@RestController
@RequestMapping("/api/push")
@RequiredArgsConstructor
public class PushController {

    private final WebPushService webPushService;
    private final AccountIdentifierService accountIdentifierService;

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> config() {
        return ResponseEntity.ok(Map.of(
                "configured", webPushService.isConfigured(),
                "publicKey", webPushService.getPublicKey()
        ));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(@Valid @RequestBody PushSubscribeRequest request) {
        webPushService.subscribe(currentUser().getId(), request);
        return ResponseEntity.ok(Map.of("status", "subscribed"));
    }

    @DeleteMapping("/subscribe")
    public ResponseEntity<Map<String, String>> unsubscribe(@RequestParam(required = false) String endpoint) {
        webPushService.unsubscribe(currentUser().getId(), endpoint);
        return ResponseEntity.ok(Map.of("status", "unsubscribed"));
    }

    private AppUser currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new IllegalStateException("Not authenticated");
        }
        return accountIdentifierService.requireByPrincipalName(auth.getName());
    }
}
