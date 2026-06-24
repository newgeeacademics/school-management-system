package com.classroom.backend.service;

import com.classroom.backend.dto.request.GradeModificationReviewRequest;
import com.classroom.backend.dto.request.GradeModificationSubmitRequest;
import com.classroom.backend.dto.request.StudentGradeRequest;
import com.classroom.backend.dto.response.GradeModificationRequestResponse;
import com.classroom.backend.model.*;
import com.classroom.backend.model.enums.GradeModificationStatus;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GradeModificationRequestService {

    private final GradeModificationRequestRepository requestRepository;
    private final StudentGradeRepository studentGradeRepository;
    private final EvaluationRepository evaluationRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AppUserRepository appUserRepository;
    private final AccountIdentifierService accountIdentifierService;
    private final GradeService gradeService;

    @Transactional(readOnly = true)
    public List<GradeModificationRequestResponse> listForCurrentUser(String statusFilter) {
        AppUser user = resolveCurrentUser();
        if (user.getRole() == UserRole.ADMIN) {
            if (statusFilter != null && !statusFilter.isBlank()) {
                GradeModificationStatus status = GradeModificationStatus.valueOf(statusFilter.trim().toUpperCase());
                return requestRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                        .map(this::toResponse)
                        .toList();
            }
            return requestRepository.findAllByOrderByCreatedAtDesc().stream()
                    .map(this::toResponse)
                    .toList();
        }
        if (user.getRole() == UserRole.TEACHER) {
            return requestRepository.findByRequestedBy_AppUser_IdOrderByCreatedAtDesc(user.getId()).stream()
                    .map(this::toResponse)
                    .toList();
        }
        throw new IllegalStateException("Access denied");
    }

    @Transactional
    public GradeModificationRequestResponse submit(GradeModificationSubmitRequest request) {
        AppUser user = resolveCurrentUser();
        if (user.getRole() != UserRole.TEACHER) {
            throw new IllegalStateException("Seuls les enseignants peuvent demander une modification de note.");
        }

        Teacher teacher = teacherRepository.findByAppUser_Id(user.getId())
                .or(() -> teacherRepository.findByEmailIgnoreCase(user.getEmail()))
                .orElseThrow(() -> new IllegalStateException("Profil enseignant introuvable."));

        Evaluation evaluation = evaluationRepository.findById(request.getEvaluationId())
                .orElseThrow(() -> new IllegalStateException("Évaluation introuvable."));
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new IllegalStateException("Élève introuvable."));

        StudentGrade existing = studentGradeRepository
                .findByEvaluationIdAndStudentId(request.getEvaluationId(), request.getStudentId())
                .orElseThrow(() -> new IllegalStateException(
                        "Aucune note enregistrée. Saisissez la note initiale directement."));

        if (existing.getScore().equals(request.getRequestedScore())) {
            throw new IllegalArgumentException("La nouvelle note est identique à la note actuelle.");
        }

        if (request.getReason() == null || request.getReason().isBlank()) {
            throw new IllegalArgumentException("Le motif de la demande est obligatoire.");
        }

        if (requestRepository.existsByEvaluation_IdAndStudent_IdAndStatus(
                request.getEvaluationId(), request.getStudentId(), GradeModificationStatus.PENDING)) {
            throw new IllegalStateException("Une demande est déjà en attente pour cette note.");
        }

        GradeModificationRequest entity = GradeModificationRequest.builder()
                .evaluation(evaluation)
                .student(student)
                .requestedBy(teacher)
                .currentScore(existing.getScore())
                .requestedScore(request.getRequestedScore())
                .reason(request.getReason().trim())
                .status(GradeModificationStatus.PENDING)
                .createdAt(Instant.now())
                .build();

        return toResponse(requestRepository.save(entity));
    }

    @Transactional
    public GradeModificationRequestResponse approve(String id, GradeModificationReviewRequest review) {
        assertAdmin();
        GradeModificationRequest entity = findPending(id);
        AppUser admin = resolveCurrentUser();

        StudentGradeRequest gradeRequest = new StudentGradeRequest();
        gradeRequest.setEvaluationId(entity.getEvaluation().getId());
        gradeRequest.setStudentId(entity.getStudent().getId());
        gradeRequest.setScore(entity.getRequestedScore());
        gradeService.createOrUpdateGrade(gradeRequest, true);

        entity.setStatus(GradeModificationStatus.APPROVED);
        entity.setReviewedBy(admin);
        entity.setAdminNote(trimNote(review != null ? review.getAdminNote() : null));
        entity.setReviewedAt(Instant.now());

        return toResponse(requestRepository.save(entity));
    }

    @Transactional
    public GradeModificationRequestResponse reject(String id, GradeModificationReviewRequest review) {
        assertAdmin();
        GradeModificationRequest entity = findPending(id);
        AppUser admin = resolveCurrentUser();

        entity.setStatus(GradeModificationStatus.REJECTED);
        entity.setReviewedBy(admin);
        entity.setAdminNote(trimNote(review != null ? review.getAdminNote() : null));
        entity.setReviewedAt(Instant.now());

        return toResponse(requestRepository.save(entity));
    }

    private GradeModificationRequest findPending(String id) {
        GradeModificationRequest entity = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Demande introuvable."));
        if (entity.getStatus() != GradeModificationStatus.PENDING) {
            throw new IllegalStateException("Cette demande a déjà été traitée.");
        }
        return entity;
    }

    private void assertAdmin() {
        AppUser user = resolveCurrentUser();
        if (user.getRole() != UserRole.ADMIN) {
            throw new IllegalStateException("Seule l'administration peut traiter les demandes.");
        }
    }

    private GradeModificationRequestResponse toResponse(GradeModificationRequest entity) {
        Evaluation evaluation = entity.getEvaluation();
        Student student = entity.getStudent();
        ClassItem classItem = evaluation != null ? evaluation.getClassItem() : null;
        Course course = evaluation != null ? evaluation.getCourse() : null;

        return GradeModificationRequestResponse.builder()
                .id(entity.getId())
                .evaluationId(evaluation != null ? evaluation.getId() : null)
                .evaluationLabel(evaluation != null ? evaluation.getLabel() : null)
                .courseName(course != null ? course.getName() : null)
                .studentId(student != null ? student.getId() : null)
                .studentName(student != null ? student.getName() : null)
                .classId(classItem != null ? classItem.getId() : null)
                .className(classItem != null ? classItem.getName() : null)
                .teacherId(entity.getRequestedBy() != null ? entity.getRequestedBy().getId() : null)
                .teacherName(entity.getRequestedBy() != null ? entity.getRequestedBy().getName() : null)
                .currentScore(entity.getCurrentScore())
                .requestedScore(entity.getRequestedScore())
                .maxScore(evaluation != null ? evaluation.getMaxScore() : null)
                .reason(entity.getReason())
                .status(entity.getStatus().name())
                .adminNote(entity.getAdminNote())
                .reviewedByName(entity.getReviewedBy() != null ? entity.getReviewedBy().getName() : null)
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null)
                .reviewedAt(entity.getReviewedAt() != null ? entity.getReviewedAt().toString() : null)
                .build();
    }

    private String trimNote(String note) {
        if (note == null || note.isBlank()) return null;
        return note.trim();
    }

    private AppUser resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new IllegalStateException("Not authenticated");
        }
        return accountIdentifierService.requireByPrincipalName(auth.getName());
    }

    public static boolean isAdminRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> "ROLE_ADMIN".equals(a));
    }
}
