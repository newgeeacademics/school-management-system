package com.classroom.backend.controller;

import com.classroom.backend.dto.email.SendEmailRequest;
import com.classroom.backend.service.email.EmailService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<?> send(@Valid @RequestBody SendEmailRequest request) throws MessagingException {
        if (!emailService.isConfigured()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error",
                    "Email not configured. Set BREVO_API_KEY (provider=brevo) or MAIL_HOST (provider=smtp)."
            ));
        }
        if (request.getHtml() != null && !request.getHtml().isBlank()) {
            emailService.sendHtmlEmail(request.getTo(), request.getSubject(), request.getHtml());
        } else {
            emailService.sendSimpleEmail(
                    request.getTo(),
                    request.getSubject(),
                    request.getText() == null ? "" : request.getText()
            );
        }
        return ResponseEntity.ok(Map.of("status", "sent"));
    }
}
