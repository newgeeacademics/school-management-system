package com.classroom.backend.controller;

import com.classroom.backend.dto.request.ParentMessageRequest;
import com.classroom.backend.dto.response.CommunicationResultResponse;
import com.classroom.backend.service.SchoolCommunicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/communications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class CommunicationController {

    private final SchoolCommunicationService schoolCommunicationService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(schoolCommunicationService.emailStatus());
    }

    @PostMapping("/parents")
    public ResponseEntity<CommunicationResultResponse> sendToParents(
            @Valid @RequestBody ParentMessageRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(schoolCommunicationService.sendMessage(request, "Administration"));
    }

    @PostMapping("/broadcast")
    public ResponseEntity<CommunicationResultResponse> broadcastToAll(
            @Valid @RequestBody ParentMessageRequest request
    ) {
        request.setAudience(com.classroom.backend.model.enums.MessageAudience.ALL_FAMILIES);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(schoolCommunicationService.sendMessage(request, "Administration"));
    }
}
