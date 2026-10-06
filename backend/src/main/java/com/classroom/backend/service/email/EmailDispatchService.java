package com.classroom.backend.service.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

/** Sends one message to many recipients in the background (see AsyncConfig#emailExecutor). */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailDispatchService {

    private final EmailService emailService;

    @Async("emailExecutor")
    public void sendToAll(List<String> recipients, String subject, String html, String plainText) {
        int sent = 0;
        for (String email : recipients) {
            try {
                emailService.sendHtmlEmail(email, subject, html);
                sent++;
            } catch (Exception e) {
                log.warn("Broadcast email failed for {}: {}", email, e.getMessage());
                try {
                    emailService.sendSimpleEmail(email, subject, plainText);
                    sent++;
                } catch (Exception ignored) {
                    log.warn("Plain broadcast email also failed for {}", email);
                }
            }
        }
        log.info("Broadcast \"{}\": {}/{} e-mail(s) sent", subject, sent, recipients.size());
    }
}
