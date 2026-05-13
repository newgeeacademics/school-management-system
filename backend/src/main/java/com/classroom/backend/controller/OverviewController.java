package com.classroom.backend.controller;

import com.classroom.backend.dto.response.OverviewResponse;
import com.classroom.backend.service.OverviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/overview")
@RequiredArgsConstructor
public class OverviewController {

    private final OverviewService overviewService;

    @GetMapping
    public ResponseEntity<OverviewResponse> getOverview() {
        return ResponseEntity.ok(overviewService.getOverview());
    }
}
