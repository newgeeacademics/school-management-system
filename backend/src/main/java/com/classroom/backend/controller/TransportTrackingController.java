package com.classroom.backend.controller;

import com.classroom.backend.dto.request.PositionUpdateRequest;
import com.classroom.backend.dto.response.LiveTrackingResponse;
import com.classroom.backend.service.TransportTrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class TransportTrackingController {

    private final TransportTrackingService trackingService;

    @GetMapping("/live")
    public ResponseEntity<List<LiveTrackingResponse>> getLiveRoutes() {
        return ResponseEntity.ok(trackingService.getLiveRoutesForCurrentUser());
    }

    @GetMapping("/routes/{routeId}")
    public ResponseEntity<LiveTrackingResponse> getLiveRoute(@PathVariable String routeId) {
        return ResponseEntity.ok(trackingService.getLiveRoute(routeId));
    }

    @PostMapping("/routes/{routeId}/trips/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TEACHER')")
    public ResponseEntity<LiveTrackingResponse> startTrip(@PathVariable String routeId) {
        return ResponseEntity.ok(trackingService.startTrip(routeId));
    }

    @PostMapping("/routes/{routeId}/position")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TEACHER')")
    public ResponseEntity<LiveTrackingResponse> updatePosition(
            @PathVariable String routeId,
            @Valid @RequestBody PositionUpdateRequest request) {
        return ResponseEntity.ok(trackingService.updatePosition(routeId, request));
    }

    @PostMapping("/routes/{routeId}/trips/stop")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TEACHER')")
    public ResponseEntity<LiveTrackingResponse> stopTrip(@PathVariable String routeId) {
        return ResponseEntity.ok(trackingService.stopTrip(routeId));
    }
}
