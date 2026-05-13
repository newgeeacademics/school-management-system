package com.classroom.backend.controller;

import com.classroom.backend.dto.request.MatiereRequest;
import com.classroom.backend.model.Matiere;
import com.classroom.backend.service.MatiereService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matieres")
@RequiredArgsConstructor
public class MatiereController {

    private final MatiereService matiereService;

    @GetMapping
    public ResponseEntity<List<Matiere>> findAll() {
        return ResponseEntity.ok(matiereService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Matiere> findById(@PathVariable String id) {
        return ResponseEntity.ok(matiereService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Matiere> create(@Valid @RequestBody MatiereRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(matiereService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Matiere> update(@PathVariable String id, @Valid @RequestBody MatiereRequest request) {
        return ResponseEntity.ok(matiereService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        matiereService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
