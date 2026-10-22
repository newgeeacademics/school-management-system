package com.classroom.backend.service;

import com.classroom.backend.dto.request.MatiereRequest;
import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.Matiere;
import com.classroom.backend.model.enums.AccessLevel;
import com.classroom.backend.model.enums.AppModule;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.DriverRepository;
import com.classroom.backend.repository.MatiereRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

/**
 * Subjects belong to one establishment. Subjects created before per-school scoping have no
 * school and stay visible to every school, so the courses that use them keep working.
 */
@Service
@RequiredArgsConstructor
public class MatiereService {

    static final String NOT_ALLOWED =
            "Seuls l'administrateur et le personnel de direction de l'établissement peuvent gérer les matières.";
    static final String NO_SCHOOL =
            "Aucun établissement associé à ce compte. Connectez-vous avec un compte de l'établissement.";
    static final String ALREADY_EXISTS = "Cette matière existe déjà dans votre établissement.";

    private final MatiereRepository matiereRepository;
    private final SchoolContextService schoolContextService;
    private final RoleAccessService roleAccessService;
    private final DriverRepository driverRepository;

    public List<Matiere> findAll() {
        return schoolContextService.getCurrentUserSchoolId()
                .map(matiereRepository::findBySchoolIdOrSchoolIdIsNull)
                .orElseGet(matiereRepository::findAll);
    }

    public Matiere findById(String id) {
        Matiere matiere = matiereRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matiere not found: " + id));
        assertVisible(matiere);
        return matiere;
    }

    @Transactional
    public Matiere create(MatiereRequest request) {
        String schoolId = requireEditorSchoolId();
        String name = request.getName().trim();
        assertNameFree(schoolId, name, null);
        Matiere matiere = Matiere.builder()
                .name(name)
                .schoolId(schoolId)
                .build();
        return matiereRepository.save(matiere);
    }

    @Transactional
    public Matiere update(String id, MatiereRequest request) {
        String schoolId = requireEditorSchoolId();
        Matiere matiere = findById(id);
        if (matiere.getSchoolId() == null) {
            // Shared legacy subject: renaming it would change it for every school.
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Cette matière est partagée entre établissements : créez plutôt la vôtre.");
        }
        String name = request.getName().trim();
        assertNameFree(schoolId, name, matiere.getId());
        matiere.setName(name);
        return matiereRepository.save(matiere);
    }

    @Transactional
    public void delete(String id) {
        Matiere matiere = findById(id);
        if (matiere.getSchoolId() != null) {
            schoolContextService.assertSchoolAccess(matiere.getSchoolId());
        }
        matiereRepository.deleteById(id);
    }

    /**
     * School admins can always manage subjects. Direction / secretariat staff can too, unless the
     * admin console was switched off for staff. Drivers are staff accounts but never manage subjects.
     */
    String requireEditorSchoolId() {
        AppUser user = schoolContextService.getCurrentUser()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, NOT_ALLOWED));
        boolean allowed = switch (user.getRole()) {
            case ADMIN -> true;
            case STAFF -> driverRepository.findByAppUser_Id(user.getId()).isEmpty()
                    && roleAccessService.hasAtLeast(UserRole.STAFF, AppModule.ADMIN_CONSOLE, AccessLevel.READ);
            default -> false;
        };
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, NOT_ALLOWED);
        }
        String schoolId = user.getSchoolId();
        if (schoolId == null || schoolId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, NO_SCHOOL);
        }
        return schoolId;
    }

    private void assertVisible(Matiere matiere) {
        if (matiere.getSchoolId() == null) {
            return;
        }
        schoolContextService.getCurrentUserSchoolId().ifPresent(schoolId -> {
            if (!schoolId.equals(matiere.getSchoolId())) {
                throw new RuntimeException("Access denied for this school");
            }
        });
    }

    private void assertNameFree(String schoolId, String name, String exceptId) {
        String key = name.toLowerCase(Locale.ROOT);
        boolean taken = matiereRepository.findBySchoolIdOrSchoolIdIsNull(schoolId).stream()
                .anyMatch(m -> !m.getId().equals(exceptId)
                        && m.getName() != null
                        && m.getName().trim().toLowerCase(Locale.ROOT).equals(key));
        if (taken) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, ALREADY_EXISTS);
        }
    }
}
