package com.classroom.backend.service;

import com.classroom.backend.dto.request.EvaluationRequest;
import com.classroom.backend.dto.request.StudentGradeRequest;
import com.classroom.backend.dto.response.GradeAverageResponse;
import com.classroom.backend.model.*;
import com.classroom.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final EvaluationRepository evaluationRepository;
    private final StudentGradeRepository studentGradeRepository;
    private final ClassItemRepository classItemRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    // --- Evaluations ---

    public List<Evaluation> findAllEvaluations() {
        return evaluationRepository.findAll();
    }

    public Evaluation findEvaluationById(String id) {
        return evaluationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evaluation not found: " + id));
    }

    public List<Evaluation> findEvaluationsByClassId(String classId) {
        return evaluationRepository.findByClassItemId(classId);
    }

    @Transactional
    public Evaluation createEvaluation(EvaluationRequest request) {
        return createEvaluation(request, null);
    }

    @Transactional
    public Evaluation createEvaluation(EvaluationRequest request, Teacher teacher) {
        ClassItem classItem = classItemRepository.findById(request.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found: " + request.getClassId()));
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found: " + request.getCourseId()));

        Evaluation evaluation = Evaluation.builder()
                .classItem(classItem)
                .course(course)
                .label(request.getLabel())
                .date(request.getDate())
                .period(request.getPeriod())
                .type(request.getType())
                .coefficient(request.getCoefficient())
                .maxScore(request.getMaxScore())
                .createdByTeacher(teacher)
                .build();

        return evaluationRepository.save(evaluation);
    }

    @Transactional
    public void deleteEvaluation(String id) {
        evaluationRepository.deleteById(id);
    }

    // --- Student Grades ---

    public List<StudentGrade> findAllGrades() {
        return studentGradeRepository.findAll();
    }

    public List<StudentGrade> findGradesByEvaluationId(String evaluationId) {
        return studentGradeRepository.findByEvaluationId(evaluationId);
    }

    public List<StudentGrade> findGradesByStudentId(String studentId) {
        return studentGradeRepository.findByStudentId(studentId);
    }

    @Transactional
    public StudentGrade createOrUpdateGrade(StudentGradeRequest request) {
        boolean allowUpdate = GradeModificationRequestService.isAdminRole();
        return createOrUpdateGrade(request, allowUpdate);
    }

    @Transactional
    public StudentGrade createOrUpdateGrade(StudentGradeRequest request, boolean allowUpdate) {
        Evaluation evaluation = evaluationRepository.findById(request.getEvaluationId())
                .orElseThrow(() -> new RuntimeException("Evaluation not found"));
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Optional<StudentGrade> existing = studentGradeRepository
                .findByEvaluationIdAndStudentId(request.getEvaluationId(), request.getStudentId());

        StudentGrade grade;
        if (existing.isPresent()) {
            if (!allowUpdate) {
                throw new IllegalStateException(
                        "La modification d'une note existante nécessite l'approbation de l'administration.");
            }
            grade = existing.get();
            grade.setScore(request.getScore());
        } else {
            grade = StudentGrade.builder()
                    .evaluation(evaluation)
                    .student(student)
                    .score(request.getScore())
                    .build();
        }

        return studentGradeRepository.save(grade);
    }

    @Transactional
    public void deleteGrade(String id) {
        studentGradeRepository.deleteById(id);
    }

    /**
     * Computes the weighted average for each student in a class:
     * average = sum(score/maxScore * 20 * coefficient) / sum(coefficient)
     * Students are ranked by descending average.
     */
    public List<GradeAverageResponse> computeClassAverages(String classId) {
        List<Evaluation> evaluations = evaluationRepository.findByClassItemId(classId);
        List<Student> students = studentRepository.findByClassItemId(classId);

        if (evaluations.isEmpty() || students.isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> evaluationIds = evaluations.stream()
                .map(Evaluation::getId)
                .collect(Collectors.toSet());

        Map<String, List<StudentGrade>> gradesByStudent = new HashMap<>();
        for (String evalId : evaluationIds) {
            List<StudentGrade> grades = studentGradeRepository.findByEvaluationId(evalId);
            for (StudentGrade g : grades) {
                gradesByStudent.computeIfAbsent(g.getStudent().getId(), k -> new ArrayList<>()).add(g);
            }
        }

        Map<String, Evaluation> evaluationMap = evaluations.stream()
                .collect(Collectors.toMap(Evaluation::getId, e -> e));

        List<GradeAverageResponse> results = new ArrayList<>();

        for (Student student : students) {
            List<StudentGrade> studentGrades = gradesByStudent.getOrDefault(student.getId(), Collections.emptyList());

            if (studentGrades.isEmpty()) {
                results.add(GradeAverageResponse.builder()
                        .studentId(student.getId())
                        .studentName(student.getName())
                        .average(null)
                        .rank(null)
                        .build());
                continue;
            }

            double weightedSum = 0;
            double coefficientSum = 0;

            for (StudentGrade grade : studentGrades) {
                Evaluation eval = evaluationMap.get(grade.getEvaluation().getId());
                if (eval != null && eval.getMaxScore() > 0) {
                    double normalizedScore = (grade.getScore() / eval.getMaxScore()) * 20.0;
                    weightedSum += normalizedScore * eval.getCoefficient();
                    coefficientSum += eval.getCoefficient();
                }
            }

            Double average = coefficientSum > 0 ? Math.round((weightedSum / coefficientSum) * 100.0) / 100.0 : null;

            results.add(GradeAverageResponse.builder()
                    .studentId(student.getId())
                    .studentName(student.getName())
                    .average(average)
                    .rank(null)
                    .build());
        }

        results.sort((a, b) -> {
            if (a.getAverage() == null && b.getAverage() == null) return 0;
            if (a.getAverage() == null) return 1;
            if (b.getAverage() == null) return -1;
            return Double.compare(b.getAverage(), a.getAverage());
        });

        int rank = 1;
        for (GradeAverageResponse r : results) {
            if (r.getAverage() != null) {
                r.setRank(rank++);
            }
        }

        return results;
    }
}
