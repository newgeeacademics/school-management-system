package com.classroom.backend.service;

import com.classroom.backend.dto.request.MatiereRequest;
import com.classroom.backend.model.Matiere;
import com.classroom.backend.repository.MatiereRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatiereService {

    private final MatiereRepository matiereRepository;

    public List<Matiere> findAll() {
        return matiereRepository.findAll();
    }

    public Matiere findById(String id) {
        return matiereRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matiere not found: " + id));
    }

    @Transactional
    public Matiere create(MatiereRequest request) {
        Matiere matiere = Matiere.builder()
                .name(request.getName())
                .build();
        return matiereRepository.save(matiere);
    }

    @Transactional
    public Matiere update(String id, MatiereRequest request) {
        Matiere matiere = findById(id);
        matiere.setName(request.getName());
        return matiereRepository.save(matiere);
    }

    @Transactional
    public void delete(String id) {
        matiereRepository.deleteById(id);
    }
}
