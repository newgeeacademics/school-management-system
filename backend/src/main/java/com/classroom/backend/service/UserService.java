package com.classroom.backend.service;

import com.classroom.backend.dto.request.UserRequest;
import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final AppUserRepository appUserRepository;
    private final PortalAccountService portalAccountService;

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
        AppUser created = portalAccountService.createLinkedAccount(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getPassword(),
                request.getRole()
        );
        if (created != null) {
            return created;
        }
        throw new RuntimeException("Email or phone is required to create an account");
    }

    @Transactional
    public AppUser update(String id, UserRequest request) {
        AppUser user = findById(id);
        portalAccountService.syncLinkedAccount(
                user, request.getName(), request.getEmail(), request.getPhone(), request.getPassword());
        user.setRole(request.getRole());
        return appUserRepository.save(user);
    }

    @Transactional
    public void delete(String id) {
        appUserRepository.deleteById(id);
    }
}
