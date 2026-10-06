package com.classroom.backend.service;

import com.classroom.backend.dto.request.ParentMessageRequest;
import com.classroom.backend.dto.response.CommunicationResultResponse;
import com.classroom.backend.dto.response.PortalMessagesResponse;
import com.classroom.backend.dto.response.PortalMessagesResponse.PortalMessageDto;
import com.classroom.backend.model.*;
import com.classroom.backend.model.enums.MessageAudience;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.*;
import com.classroom.backend.service.email.EmailDispatchService;
import com.classroom.backend.service.email.EmailService;
import com.classroom.backend.service.email.templates.BrandedMessageEmailTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SchoolCommunicationService {

    private final EmailService emailService;
    private final ParentContactRepository parentContactRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ClassItemRepository classItemRepository;
    private final SchoolMessageRepository schoolMessageRepository;
    private final PortalScopeResolver portalScopeResolver;
    private final SchoolContextService schoolContextService;
    private final EmailDispatchService emailDispatchService;

    @Value("${app.public.portal-url:http://localhost:5174}")
    private String portalUrl;

    /** Message from the establishment console: recipients are limited to the admin's school. */
    @Transactional
    public CommunicationResultResponse sendMessage(ParentMessageRequest request, String senderName) {
        return sendMessage(request, senderName, schoolContextService.requireCurrentSchoolId());
    }

    @Transactional
    public CommunicationResultResponse sendMessage(ParentMessageRequest request, String senderName, String schoolId) {
        MessageAudience audience = request.getAudience() != null
                ? request.getAudience()
                : MessageAudience.PARENTS;

        Set<String> emails = resolveRecipientEmails(request, audience, schoolId);
        int emailsSent = 0;

        if (request.isSendEmail()) {
            emailsSent = dispatchEmails(emails, request.getSubject(), request.getBody());
        }

        boolean portalPublished = false;
        if (request.isPublishOnPortal()) {
            schoolMessageRepository.save(SchoolMessage.builder()
                    .subject(request.getSubject().trim())
                    .body(request.getBody().trim())
                    .senderName(senderName != null && !senderName.isBlank() ? senderName.trim() : "Administration")
                    .audience(audience)
                    .classId(trimOrNull(request.getClassId()))
                    .schoolId(schoolId)
                    .sentAt(Instant.now())
                    .build());
            portalPublished = true;
        }

        return CommunicationResultResponse.builder()
                .recipientsCount(emails.size())
                .emailsSent(emailsSent)
                .emailConfigured(emailService.isConfigured())
                .portalPublished(portalPublished)
                .message(buildResultMessage(emails.size(), emailsSent, request.isSendEmail()))
                .build();
    }

    public CommunicationResultResponse notifyAnnouncementPublished(Announcement announcement) {
        String subject = announcement.getTitle().trim();
        StringBuilder body = new StringBuilder(announcement.getBody().trim());
        if (announcement.getEventDate() != null && !announcement.getEventDate().isBlank()) {
            body.append("\n\nDate : ").append(announcement.getEventDate().trim());
        }
        if (announcement.getLocation() != null && !announcement.getLocation().isBlank()) {
            body.append("\nLieu : ").append(announcement.getLocation().trim());
        }
        body.append("\n\nConsultez le portail familles : ")
                .append(normalizePortalUrl())
                .append("/accueil/announcements");

        String schoolId = announcement.getSchoolId();
        Set<String> emails = schoolId == null ? Set.of() : collectAllFamilyEmails(schoolId);
        int emailsSent = dispatchEmails(emails, subject, body.toString());

        return CommunicationResultResponse.builder()
                .recipientsCount(emails.size())
                .emailsSent(emailsSent)
                .emailConfigured(emailService.isConfigured())
                .portalPublished(true)
                .message(buildResultMessage(emails.size(), emailsSent, true))
                .build();
    }

    @Transactional
    public CommunicationResultResponse sendTeacherClassMessage(String classId, String subject, String body) {
        PortalScopeResolver.PortalScope scope = portalScopeResolver.resolveForCurrentUser();
        scope.assertCanEdit();
        scope.assertClassAccessible(classId);

        Teacher teacher = portalScopeResolver.resolveTeacherForCurrentUser();
        ParentMessageRequest request = new ParentMessageRequest();
        request.setSubject(subject);
        request.setBody(body);
        request.setAudience(MessageAudience.CLASS_PARENTS);
        request.setClassId(classId);
        request.setSendEmail(true);
        request.setPublishOnPortal(true);

        return sendMessage(request, teacher.getName(), teacher.getSchoolId());
    }

    @Transactional(readOnly = true)
    public PortalMessagesResponse getPortalMessages() {
        PortalScopeResolver.PortalScope scope = portalScopeResolver.resolveForCurrentUser();
        Set<String> accessibleClassIds = scope.classIds();

        Map<String, String> classNames = classItemRepository.findAll().stream()
                .collect(Collectors.toMap(ClassItem::getId, ClassItem::getName, (a, b) -> a));

        Set<String> schoolIds = scope.schoolIds();
        List<SchoolMessage> messages = schoolIds.isEmpty()
                ? List.of()
                : schoolMessageRepository.findBySchoolIdInOrderBySentAtDesc(schoolIds);

        List<PortalMessageDto> items = messages.stream()
                .filter(msg -> isMessageVisible(msg, scope.role(), accessibleClassIds))
                .map(msg -> PortalMessageDto.builder()
                        .id(msg.getId())
                        .subject(msg.getSubject())
                        .body(msg.getBody())
                        .senderName(msg.getSenderName())
                        .sentAt(msg.getSentAt() != null ? msg.getSentAt().toString() : null)
                        .className(msg.getClassId() != null ? classNames.get(msg.getClassId()) : null)
                        .build())
                .toList();

        return PortalMessagesResponse.builder().messages(items).build();
    }

    public Map<String, Object> emailStatus() {
        return Map.of(
                "configured", emailService.isConfigured(),
                "enabled", emailService.isEnabled()
        );
    }

    private boolean isMessageVisible(SchoolMessage msg, UserRole role, Set<String> classIds) {
        MessageAudience audience = msg.getAudience();
        if (audience == MessageAudience.ALL_FAMILIES) {
            return role == UserRole.PARENT || role == UserRole.STUDENT || role == UserRole.TEACHER;
        }
        if (audience == MessageAudience.PARENTS) {
            return role == UserRole.PARENT;
        }
        if (audience == MessageAudience.CLASS_PARENTS) {
            return msg.getClassId() != null
                    && classIds.contains(msg.getClassId())
                    && (role == UserRole.PARENT || role == UserRole.STUDENT || role == UserRole.TEACHER);
        }
        return false;
    }

    private Set<String> resolveRecipientEmails(ParentMessageRequest request, MessageAudience audience, String schoolId) {
        if (schoolId == null || schoolId.isBlank()) {
            throw new IllegalStateException("Aucun établissement associé à ce message.");
        }
        return switch (audience) {
            case ALL_FAMILIES -> collectAllFamilyEmails(schoolId);
            case PARENTS -> collectAllParentEmails(schoolId);
            case CLASS_PARENTS -> {
                String classId = trimOrNull(request.getClassId());
                if (classId == null) {
                    throw new IllegalArgumentException("Choisissez une classe pour ce message.");
                }
                ClassItem classItem = classItemRepository.findById(classId)
                        .orElseThrow(() -> new IllegalArgumentException("Classe introuvable."));
                if (classItem.getSchoolId() != null && !classItem.getSchoolId().equals(schoolId)) {
                    throw new IllegalStateException("Cette classe n'appartient pas à votre établissement.");
                }
                yield collectParentEmailsForClass(classId);
            }
        };
    }

    private Set<String> collectAllFamilyEmails(String schoolId) {
        Set<String> emails = new LinkedHashSet<>();
        emails.addAll(collectAllParentEmails(schoolId));
        emails.addAll(collectAllStudentEmails(schoolId));
        emails.addAll(collectAllTeacherEmails(schoolId));
        return emails;
    }

    private Set<String> collectAllParentEmails(String schoolId) {
        Set<String> emails = parentContactRepository.findBySchoolId(schoolId).stream()
                .map(this::resolveParentEmail)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        // Parents saved without school_id are still reachable through their child's school.
        studentRepository.findBySchoolId(schoolId).stream()
                .flatMap(student -> parentContactRepository.findByStudentId(student.getId()).stream())
                .map(this::resolveParentEmail)
                .filter(Objects::nonNull)
                .forEach(emails::add);
        return emails;
    }

    private Set<String> collectParentEmailsForClass(String classId) {
        return studentRepository.findByClassItemId(classId).stream()
                .flatMap(student -> parentContactRepository.findByStudentId(student.getId()).stream())
                .map(this::resolveParentEmail)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<String> collectAllStudentEmails(String schoolId) {
        return studentRepository.findBySchoolId(schoolId).stream()
                .map(this::resolveStudentEmail)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<String> collectAllTeacherEmails(String schoolId) {
        return teacherRepository.findBySchoolId(schoolId).stream()
                .map(this::resolveTeacherEmail)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private String resolveParentEmail(ParentContact parent) {
        if (parent.getEmail() != null && !parent.getEmail().isBlank()) {
            return parent.getEmail().trim().toLowerCase(Locale.ROOT);
        }
        if (parent.getAppUser() != null
                && parent.getAppUser().getEmail() != null
                && !parent.getAppUser().getEmail().isBlank()) {
            return parent.getAppUser().getEmail().trim().toLowerCase(Locale.ROOT);
        }
        return null;
    }

    private String resolveStudentEmail(Student student) {
        if (student.getEmail() != null && !student.getEmail().isBlank()) {
            return student.getEmail().trim().toLowerCase(Locale.ROOT);
        }
        if (student.getAppUser() != null
                && student.getAppUser().getEmail() != null
                && !student.getAppUser().getEmail().isBlank()) {
            return student.getAppUser().getEmail().trim().toLowerCase(Locale.ROOT);
        }
        return null;
    }

    private String resolveTeacherEmail(Teacher teacher) {
        if (teacher.getEmail() != null && !teacher.getEmail().isBlank()) {
            return teacher.getEmail().trim().toLowerCase(Locale.ROOT);
        }
        if (teacher.getAppUser() != null
                && teacher.getAppUser().getEmail() != null
                && !teacher.getAppUser().getEmail().isBlank()) {
            return teacher.getAppUser().getEmail().trim().toLowerCase(Locale.ROOT);
        }
        return null;
    }

    /** Queues the e-mails for background delivery and returns how many were queued. */
    private int dispatchEmails(Set<String> emails, String subject, String body) {
        if (!emailService.isConfigured() || emails.isEmpty()) {
            return 0;
        }
        String html = BrandedMessageEmailTemplate.html(
                subject,
                body,
                normalizePortalUrl(),
                emailService.resolveEmailLogoUrl()
        );
        emailDispatchService.sendToAll(List.copyOf(emails), subject, html, body);
        return emails.size();
    }

    private String buildResultMessage(int recipients, int sent, boolean sendEmailRequested) {
        if (!sendEmailRequested) {
            return "Message enregistré sur le portail.";
        }
        if (!emailService.isConfigured()) {
            return "E-mail non configuré (BREVO_API_KEY ou SMTP). Message portail enregistré si demandé.";
        }
        if (recipients == 0) {
            return "Aucune adresse e-mail trouvée pour cette audience.";
        }
        return "Envoi en cours : " + sent + " e-mail(s) vers " + recipients + " destinataire(s).";
    }

    private String normalizePortalUrl() {
        String base = portalUrl == null ? "" : portalUrl.trim().replaceAll("/+$", "");
        return base.isBlank() ? "http://localhost:5174" : base;
    }

    private static String trimOrNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
