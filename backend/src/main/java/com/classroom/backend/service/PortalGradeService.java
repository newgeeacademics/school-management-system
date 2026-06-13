package com.classroom.backend.service;

import com.classroom.backend.dto.request.EvaluationRequest;
import com.classroom.backend.dto.request.StudentGradeRequest;
import com.classroom.backend.dto.response.GradeAverageResponse;
import com.classroom.backend.dto.response.PortalGradesDetailResponse;
import com.classroom.backend.dto.response.PortalGradesDetailResponse.*;
import com.classroom.backend.model.*;
import com.classroom.backend.model.enums.EvaluationPeriod;
import com.classroom.backend.model.enums.EvaluationType;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.CourseRepository;
import com.classroom.backend.repository.EvaluationRepository;
import com.classroom.backend.repository.StudentGradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortalGradeService {

    private final PortalScopeResolver scopeResolver;
    private final GradeService gradeService;
    private final SchoolService schoolService;
    private final EvaluationDocumentService evaluationDocumentService;
    private final EvaluationRepository evaluationRepository;
    private final StudentGradeRepository studentGradeRepository;
    private final CourseRepository courseRepository;

    private static final Map<EvaluationPeriod, String> PERIOD_LABELS = Map.of(
            EvaluationPeriod.TRIMESTRE_1, "Trimestre 1",
            EvaluationPeriod.TRIMESTRE_2, "Trimestre 2",
            EvaluationPeriod.TRIMESTRE_3, "Trimestre 3",
            EvaluationPeriod.SEMESTRE_1, "Semestre 1",
            EvaluationPeriod.SEMESTRE_2, "Semestre 2"
    );

    private static final Map<String, EvaluationPeriod> PERIOD_FROM_LABEL = Map.of(
            "Trimestre 1", EvaluationPeriod.TRIMESTRE_1,
            "Trimestre 2", EvaluationPeriod.TRIMESTRE_2,
            "Trimestre 3", EvaluationPeriod.TRIMESTRE_3,
            "Semestre 1", EvaluationPeriod.SEMESTRE_1,
            "Semestre 2", EvaluationPeriod.SEMESTRE_2
    );

    private static final Map<EvaluationType, String> TYPE_LABELS = Map.ofEntries(
            Map.entry(EvaluationType.DEVOIR, "Devoir"),
            Map.entry(EvaluationType.INTERRO, "Interro"),
            Map.entry(EvaluationType.EXAMEN, "Examen"),
            Map.entry(EvaluationType.COMPOSITION, "Composition"),
            Map.entry(EvaluationType.CONTROLE, "Contrôle"),
            Map.entry(EvaluationType.PROJET, "Projet")
    );

    @Transactional(readOnly = true)
    public PortalGradesDetailResponse getGradesDetail(String classId, String periodLabel, String studentId) {
        PortalScopeResolver.PortalScope scope = scopeResolver.resolveForCurrentUser();
        EvaluationPeriod period = resolvePeriod(periodLabel);

        String resolvedClassId = resolveClassId(scope, classId, studentId);
        String resolvedStudentId = resolveStudentId(scope, studentId);

        if (resolvedClassId != null) {
            scope.assertClassAccessible(resolvedClassId);
        }
        if (resolvedStudentId != null) {
            scope.assertStudentAccessible(resolvedStudentId);
        }

        List<ClassItem> classes = scope.classes();
        List<Student> scopedStudents = filterStudents(scope, resolvedClassId, resolvedStudentId);

        List<Course> courses = resolvedClassId != null
                ? coursesForClass(classes, resolvedClassId)
                : List.of();

        List<Evaluation> evaluations = resolvedClassId != null
                ? evaluationRepository.findByClassItemIdAndPeriod(resolvedClassId, period)
                : List.of();

        Set<String> evaluationIds = evaluations.stream().map(Evaluation::getId).collect(Collectors.toSet());
        Set<String> studentIds = scopedStudents.stream().map(Student::getId).collect(Collectors.toSet());

        List<StudentGrade> grades = studentGradeRepository.findAll().stream()
                .filter(g -> g.getStudent() != null && studentIds.contains(g.getStudent().getId()))
                .filter(g -> g.getEvaluation() != null && evaluationIds.contains(g.getEvaluation().getId()))
                .toList();

        List<GradeAverageResponse> bulletin = resolvedClassId != null
                ? gradeService.computeClassAverages(resolvedClassId).stream()
                        .filter(row -> studentIds.contains(row.getStudentId()))
                        .toList()
                : List.of();

        Map<String, String> classNames = classes.stream()
                .collect(Collectors.toMap(ClassItem::getId, ClassItem::getName, (a, b) -> a));

        return PortalGradesDetailResponse.builder()
                .role(scope.role().name())
                .canEdit(scope.canEdit())
                .classId(resolvedClassId)
                .period(PERIOD_LABELS.getOrDefault(period, period.name()))
                .studentId(resolvedStudentId)
                .classes(classes.stream().map(c -> PortalClassOption.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .level(c.getLevel())
                        .build()).toList())
                .courses(courses.stream().map(c -> PortalCourseOption.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .build()).toList())
                .students(scopedStudents.stream().map(s -> PortalStudentOption.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .classId(s.getClassItem() != null ? s.getClassItem().getId() : null)
                        .className(s.getClassItem() != null
                                ? classNames.getOrDefault(s.getClassItem().getId(), s.getClassItem().getName())
                                : null)
                        .build()).toList())
                .evaluations(evaluations.stream().map(this::toEvaluationDto).toList())
                .grades(grades.stream().map(this::toGradeDto).toList())
                .bulletin(bulletin)
                .gradingConfig(buildGradingConfig())
                .build();
    }

    @Transactional
    public PortalEvaluationDto createEvaluation(EvaluationRequest request) {
        PortalScopeResolver.PortalScope scope = scopeResolver.resolveForCurrentUser();
        scope.assertCanEdit();
        scope.assertClassAccessible(request.getClassId());

        Teacher teacher = scopeResolver.resolveTeacherForCurrentUser();
        if (request.getMaxScore() == null || request.getMaxScore() <= 0) {
            request.setMaxScore(defaultGradingScale());
        }
        Evaluation saved = gradeService.createEvaluation(request, teacher);
        return toEvaluationDto(saved);
    }

    @Transactional
    public PortalEvaluationDto uploadEvaluationDocument(String evaluationId, org.springframework.web.multipart.MultipartFile file)
            throws java.io.IOException {
        PortalScopeResolver.PortalScope scope = scopeResolver.resolveForCurrentUser();
        scope.assertCanEdit();

        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new IllegalStateException("Évaluation introuvable."));
        scope.assertClassAccessible(evaluation.getClassItem().getId());

        Teacher teacher = scopeResolver.resolveTeacherForCurrentUser();
        if (evaluation.getCreatedByTeacher() != null
                && !evaluation.getCreatedByTeacher().getId().equals(teacher.getId())) {
            throw new IllegalStateException("Seul l'enseignant créateur peut joindre le document.");
        }

        Evaluation saved = evaluationDocumentService.attachDocument(evaluationId, file);
        return toEvaluationDto(saved);
    }

    @Transactional(readOnly = true)
    public EvaluationDocumentService.DocumentDownload downloadEvaluationDocument(String evaluationId)
            throws java.io.IOException {
        PortalScopeResolver.PortalScope scope = scopeResolver.resolveForCurrentUser();
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new IllegalStateException("Évaluation introuvable."));
        scope.assertClassAccessible(evaluation.getClassItem().getId());
        return evaluationDocumentService.openDocument(evaluationId);
    }

    private PortalGradesDetailResponse.PortalGradingConfigDto buildGradingConfig() {
        School school = schoolService.getPrimarySchool();
        double scale = school != null && school.getGradingScale() != null ? school.getGradingScale() : 20.0;
        List<String> types = splitCsv(school != null ? school.getEvaluationTypes() : null,
                List.of("Devoir", "Interro", "Examen"));
        List<String> periods = splitCsv(school != null ? school.getEvaluationPeriods() : null,
                List.of("Trimestre 1", "Trimestre 2", "Trimestre 3"));
        return PortalGradesDetailResponse.PortalGradingConfigDto.builder()
                .gradingScale(scale)
                .evaluationTypes(types)
                .evaluationPeriods(periods)
                .build();
    }

    private double defaultGradingScale() {
        School school = schoolService.getPrimarySchool();
        return school != null && school.getGradingScale() != null ? school.getGradingScale() : 20.0;
    }

    private static List<String> splitCsv(String raw, List<String> fallback) {
        if (raw == null || raw.isBlank()) {
            return fallback;
        }
        List<String> parts = Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        return parts.isEmpty() ? fallback : parts;
    }

    @Transactional
    public PortalGradeEntryDto saveGrade(StudentGradeRequest request) {
        PortalScopeResolver.PortalScope scope = scopeResolver.resolveForCurrentUser();
        scope.assertCanEdit();
        scope.assertStudentAccessible(request.getStudentId());

        Evaluation evaluation = evaluationRepository.findById(request.getEvaluationId())
                .orElseThrow(() -> new IllegalStateException("Évaluation introuvable."));
        scope.assertClassAccessible(evaluation.getClassItem().getId());

        StudentGrade saved = gradeService.createOrUpdateGrade(request);
        return toGradeDto(saved);
    }

    private EvaluationPeriod resolvePeriod(String periodLabel) {
        if (periodLabel == null || periodLabel.isBlank()) {
            return EvaluationPeriod.TRIMESTRE_1;
        }
        EvaluationPeriod fromLabel = PERIOD_FROM_LABEL.get(periodLabel.trim());
        if (fromLabel != null) {
            return fromLabel;
        }
        try {
            return EvaluationPeriod.valueOf(periodLabel.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return EvaluationPeriod.TRIMESTRE_1;
        }
    }

    private String resolveClassId(PortalScopeResolver.PortalScope scope, String classId, String studentId) {
        if (classId != null && !classId.isBlank()) {
            return classId;
        }
        if (studentId != null && !studentId.isBlank()) {
            return scope.students().stream()
                    .filter(s -> s.getId().equals(studentId))
                    .map(s -> s.getClassItem() != null ? s.getClassItem().getId() : null)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);
        }
        if (scope.role() == UserRole.STUDENT && scope.classes().size() == 1) {
            return scope.classes().get(0).getId();
        }
        if (scope.role() == UserRole.TEACHER && scope.classes().size() == 1) {
            return scope.classes().get(0).getId();
        }
        return null;
    }

    private String resolveStudentId(PortalScopeResolver.PortalScope scope, String studentId) {
        if (studentId != null && !studentId.isBlank()) {
            return studentId;
        }
        if (scope.role() == UserRole.STUDENT && scope.students().size() == 1) {
            return scope.students().get(0).getId();
        }
        return null;
    }

    private List<Student> filterStudents(
            PortalScopeResolver.PortalScope scope,
            String classId,
            String studentId
    ) {
        List<Student> list = scope.students();
        if (studentId != null && !studentId.isBlank()) {
            return list.stream().filter(s -> s.getId().equals(studentId)).toList();
        }
        if (classId != null && !classId.isBlank()) {
            return list.stream()
                    .filter(s -> s.getClassItem() != null && classId.equals(s.getClassItem().getId()))
                    .toList();
        }
        return list;
    }

    private List<Course> coursesForClass(List<ClassItem> classes, String classId) {
        return classes.stream()
                .filter(c -> c.getId().equals(classId))
                .findFirst()
                .map(c -> courseRepository.findByLevel(c.getLevel()))
                .orElse(List.of());
    }

    private PortalEvaluationDto toEvaluationDto(Evaluation e) {
        boolean hasDoc = e.getDocumentStoredName() != null && !e.getDocumentStoredName().isBlank();
        return PortalEvaluationDto.builder()
                .id(e.getId())
                .classId(e.getClassItem().getId())
                .courseId(e.getCourse().getId())
                .courseName(e.getCourse().getName())
                .label(e.getLabel())
                .date(e.getDate())
                .period(PERIOD_LABELS.getOrDefault(e.getPeriod(), e.getPeriod().name()))
                .type(TYPE_LABELS.getOrDefault(e.getType(), e.getType().name()))
                .coefficient(e.getCoefficient())
                .maxScore(e.getMaxScore())
                .teacherName(e.getCreatedByTeacher() != null ? e.getCreatedByTeacher().getName() : null)
                .hasDocument(hasDoc)
                .documentFileName(e.getDocumentOriginalName())
                .documentContentType(e.getDocumentContentType())
                .build();
    }

    private PortalGradeEntryDto toGradeDto(StudentGrade g) {
        return PortalGradeEntryDto.builder()
                .id(g.getId())
                .evaluationId(g.getEvaluation().getId())
                .studentId(g.getStudent().getId())
                .score(g.getScore())
                .build();
    }
}
