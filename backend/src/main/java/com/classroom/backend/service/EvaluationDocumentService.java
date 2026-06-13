package com.classroom.backend.service;

import com.classroom.backend.model.Evaluation;
import com.classroom.backend.repository.EvaluationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EvaluationDocumentService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "png", "jpg", "jpeg"
    );

    private final EvaluationRepository evaluationRepository;

    @Value("${app.uploads.evaluation-dir:uploads/evaluations}")
    private String evaluationUploadDir;

    @Transactional
    public Evaluation attachDocument(String evaluationId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fichier requis.");
        }
        String original = file.getOriginalFilename();
        if (original == null || original.isBlank()) {
            throw new IllegalArgumentException("Nom de fichier invalide.");
        }
        String ext = extension(original);
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("Format non autorisé. Utilisez PDF, Word, Excel, PowerPoint ou image.");
        }

        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new IllegalStateException("Évaluation introuvable."));

        deleteStoredFile(evaluation);

        Path dir = Paths.get(evaluationUploadDir).toAbsolutePath().normalize();
        Files.createDirectories(dir);
        String storedName = evaluationId + "-" + UUID.randomUUID() + "." + ext;
        Path target = dir.resolve(storedName);
        Files.copy(file.getInputStream(), target);

        evaluation.setDocumentStoredName(storedName);
        evaluation.setDocumentOriginalName(original);
        evaluation.setDocumentContentType(
                file.getContentType() != null ? file.getContentType() : guessContentType(ext));
        return evaluationRepository.save(evaluation);
    }

    @Transactional(readOnly = true)
    public DocumentDownload openDocument(String evaluationId) throws IOException {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new IllegalStateException("Évaluation introuvable."));
        if (evaluation.getDocumentStoredName() == null || evaluation.getDocumentStoredName().isBlank()) {
            throw new IllegalStateException("Aucun document pour cette évaluation.");
        }

        Path file = Paths.get(evaluationUploadDir).toAbsolutePath().normalize()
                .resolve(evaluation.getDocumentStoredName());
        if (!Files.exists(file)) {
            throw new IllegalStateException("Fichier introuvable sur le serveur.");
        }

        Resource resource = new UrlResource(file.toUri());
        return new DocumentDownload(
                resource,
                evaluation.getDocumentOriginalName() != null
                        ? evaluation.getDocumentOriginalName()
                        : evaluation.getDocumentStoredName(),
                evaluation.getDocumentContentType() != null
                        ? evaluation.getDocumentContentType()
                        : "application/octet-stream"
        );
    }

    private void deleteStoredFile(Evaluation evaluation) throws IOException {
        if (evaluation.getDocumentStoredName() == null || evaluation.getDocumentStoredName().isBlank()) {
            return;
        }
        Path existing = Paths.get(evaluationUploadDir).toAbsolutePath().normalize()
                .resolve(evaluation.getDocumentStoredName());
        Files.deleteIfExists(existing);
    }

    private static String extension(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) {
            return "";
        }
        return filename.substring(dot + 1).toLowerCase();
    }

    private static String guessContentType(String ext) {
        return switch (ext) {
            case "pdf" -> "application/pdf";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "ppt" -> "application/vnd.ms-powerpoint";
            case "pptx" -> "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "xls" -> "application/vnd.ms-excel";
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            default -> "application/octet-stream";
        };
    }

    public record DocumentDownload(Resource resource, String filename, String contentType) {}
}
