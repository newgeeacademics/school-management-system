package com.classroom.backend.service;

import com.classroom.backend.dto.request.UserRequest;
import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public List<AppUser> findAll() {
        return appUserRepository.findAll();
    }

    public AppUser findById(String id) {
        return appUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public List<AppUser> findByRole(UserRole role) {
        return appUserRepository.findByRole(role);
    }

    @Transactional
    public AppUser create(UserRequest request) {
        if (appUserRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use: " + request.getEmail());
        }

        String password = request.getPassword() != null ? request.getPassword() : "changeme";

        AppUser user = AppUser.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(password))
                .role(request.getRole())
                .build();

        return appUserRepository.save(user);
    }

    @Transactional
    public AppUser update(String id, UserRequest request) {
        AppUser user = findById(id);
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return appUserRepository.save(user);
    }

    @Transactional
    public void delete(String id) {
        appUserRepository.deleteById(id);
    }
}
