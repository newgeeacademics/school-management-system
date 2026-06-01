package com.classroom.backend.controller;

import com.classroom.backend.dto.response.PortalFeedResponse;
import com.classroom.backend.service.PortalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portal")
@RequiredArgsConstructor
public class PortalController {

    private final PortalService portalService;

    /** Role-scoped feed: teacher → their classes/students; student → their class; parent → children. */
    @GetMapping("/feed")
    public ResponseEntity<PortalFeedResponse> feed() {
        return ResponseEntity.ok(portalService.getFeedForCurrentUser());
    }
}
