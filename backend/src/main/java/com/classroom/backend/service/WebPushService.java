package com.classroom.backend.service;

import com.classroom.backend.dto.request.PushSubscribeRequest;
import com.classroom.backend.model.PushSubscription;
import com.classroom.backend.repository.PushSubscriptionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushAsyncService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Security;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebPushService {

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.push.vapid.public-key:}")
    private String vapidPublicKey;

    @Value("${app.push.vapid.private-key:}")
    private String vapidPrivateKey;

    @Value("${app.push.vapid.subject:mailto:contact@newgeeacademy.com}")
    private String vapidSubject;

    private PushAsyncService pushAsyncService;

    @PostConstruct
    void initProvider() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    public boolean isConfigured() {
        return vapidPublicKey != null && !vapidPublicKey.isBlank()
                && vapidPrivateKey != null && !vapidPrivateKey.isBlank();
    }

    public String getPublicKey() {
        return vapidPublicKey == null ? "" : vapidPublicKey.trim();
    }

    @Transactional
    public void subscribe(String appUserId, PushSubscribeRequest request) {
        String endpoint = request.getEndpoint().trim();
        pushSubscriptionRepository.findByEndpoint(endpoint).ifPresent(existing -> {
            if (!existing.getAppUserId().equals(appUserId)) {
                pushSubscriptionRepository.delete(existing);
            }
        });

        PushSubscription sub = pushSubscriptionRepository.findByEndpoint(endpoint)
                .orElse(PushSubscription.builder().build());
        sub.setAppUserId(appUserId);
        sub.setEndpoint(endpoint);
        sub.setP256dh(request.getP256dh().trim());
        sub.setAuthKey(request.getAuth().trim());
        pushSubscriptionRepository.save(sub);
    }

    @Transactional
    public void unsubscribe(String appUserId, String endpoint) {
        if (endpoint == null || endpoint.isBlank()) {
            pushSubscriptionRepository.findByAppUserId(appUserId)
                    .forEach(pushSubscriptionRepository::delete);
            return;
        }
        pushSubscriptionRepository.deleteByAppUserIdAndEndpoint(appUserId, endpoint.trim());
    }

    public void sendToUsers(Collection<String> appUserIds, String title, String body, String url, String tag) {
        if (!isConfigured() || appUserIds == null || appUserIds.isEmpty()) {
            return;
        }
        PushAsyncService service = pushService();
        if (service == null) {
            return;
        }

        String payload;
        try {
            Map<String, String> message = new LinkedHashMap<>();
            message.put("title", title != null ? title : "NewGee");
            message.put("body", body != null ? body : "");
            message.put("url", url != null && !url.isBlank() ? url : "/accueil/notifications");
            if (tag != null && !tag.isBlank()) {
                message.put("tag", tag);
            }
            payload = objectMapper.writeValueAsString(message);
        } catch (Exception e) {
            log.warn("Push payload serialization failed", e);
            return;
        }

        for (String userId : appUserIds) {
            if (userId == null || userId.isBlank()) {
                continue;
            }
            List<PushSubscription> subs = pushSubscriptionRepository.findByAppUserId(userId);
            for (PushSubscription sub : subs) {
                sendOne(service, sub, payload);
            }
        }
    }

    private void sendOne(PushAsyncService service, PushSubscription sub, String payload) {
        try {
            Subscription subscription = new Subscription(
                    sub.getEndpoint(),
                    new Subscription.Keys(sub.getP256dh(), sub.getAuthKey())
            );
            Notification notification = new Notification(subscription, payload);
            CompletableFuture<?> future = service.send(notification);
            future.whenComplete((result, error) -> {
                if (error != null) {
                    log.warn("Push delivery failed for {}: {}", sub.getEndpoint(), error.getMessage());
                    if (isGone(error)) {
                        pushSubscriptionRepository.delete(sub);
                    }
                }
            });
        } catch (Exception e) {
            log.warn("Push send failed for {}", sub.getEndpoint(), e);
        }
    }

    private static boolean isGone(Throwable error) {
        String msg = error.getMessage();
        return msg != null && (msg.contains("410") || msg.contains("404") || msg.contains("Gone"));
    }

    private PushAsyncService pushService() {
        if (!isConfigured()) {
            return null;
        }
        if (pushAsyncService == null) {
            PushAsyncService service = new PushAsyncService();
            try {
                service.setPublicKey(getPublicKey());
                service.setPrivateKey(vapidPrivateKey.trim());
                service.setSubject(vapidSubject.trim());
                pushAsyncService = service;
            } catch (Exception e) {
                log.error("Web Push init failed", e);
                return null;
            }
        }
        return pushAsyncService;
    }
}
