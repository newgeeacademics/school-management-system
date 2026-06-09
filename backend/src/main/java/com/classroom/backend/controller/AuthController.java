package com.classroom.backend.controller;

import com.classroom.backend.dto.auth.AuthResponse;
import com.classroom.backend.dto.auth.LoginRequest;
import com.classroom.backend.dto.auth.RegisterRequest;
import com.classroom.backend.dto.auth.RegisterSchoolRequest;
import com.classroom.backend.repository.SchoolRepository;
import com.classroom.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SchoolRepository schoolRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Creates admin account + school in one transaction (used by main site registration). */
    @PostMapping("/register-school")
    public ResponseEntity<AuthResponse> registerSchool(@Valid @RequestBody RegisterSchoolRequest request) {
        AuthResponse response = authService.registerSchool(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /** Check whether a legal registration / RCCM number is already used. */
    @GetMapping("/verify-registration-number")
    public ResponseEntity<Map<String, Object>> verifyRegistrationNumber(@RequestParam String number) {
        String normalized = number == null ? "" : number.trim();
        if (normalized.isBlank()) {
            return ResponseEntity.ok(Map.of(
                    "available", true,
                    "message", "Numéro vide."
            ));
        }
        boolean taken = schoolRepository.existsByRegistrationNumberIgnoreCase(normalized);
        return ResponseEntity.ok(Map.of(
                "available", !taken,
                "message", taken ? "Ce numéro d'identification est déjà enregistré." : "Numéro disponible."
        ));
    }
}
