package com.classroom.backend.controller;

import com.classroom.backend.dto.request.RoleModuleAccessRequest;
import com.classroom.backend.dto.response.MyRoleAccessResponse;
import com.classroom.backend.dto.response.RoleModuleAccessResponse;
import com.classroom.backend.service.RoleAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/role-access")
@RequiredArgsConstructor
public class RoleAccessController {

    private final RoleAccessService roleAccessService;

    @GetMapping("/my")
    public ResponseEntity<MyRoleAccessResponse> myAccess() {
        return ResponseEntity.ok(roleAccessService.myAccess());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RoleModuleAccessResponse>> findAll() {
        return ResponseEntity.ok(roleAccessService.findAll());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RoleModuleAccessResponse>> updateAll(
            @Valid @RequestBody List<RoleModuleAccessRequest> requests
    ) {
        return ResponseEntity.ok(roleAccessService.updateAll(requests));
    }
}
