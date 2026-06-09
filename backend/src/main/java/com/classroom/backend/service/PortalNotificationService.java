package com.classroom.backend.service;

import com.classroom.backend.dto.response.PortalNotificationsResponse;
import com.classroom.backend.dto.response.PortalNotificationsResponse.PortalNotificationDto;
import com.classroom.backend.model.*;
import com.classroom.backend.model.enums.AttendanceStatus;
import com.classroom.backend.model.enums.PaymentStatus;
import com.classroom.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortalNotificationService {

    private final PortalScopeResolver portalScopeResolver;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final StudentGradeRepository studentGradeRepository;
    private final CalendarEventRepository calendarEventRepository;
    private final PaymentReminderRepository paymentReminderRepository;

    @Transactional(readOnly = true)
    public PortalNotificationsResponse getNotifications() {
        PortalScopeResolver.PortalScope scope = portalScopeResolver.resolveForCurrentUser();
        Set<String> studentIds = scope.studentIds();
        Set<String> studentNames = scope.students().stream()
                .map(Student::getName)
                .collect(Collectors.toSet());
        String parentName = scope.user().getName();

        List<PortalNotificationDto> items = new ArrayList<>();

        if (!studentIds.isEmpty()) {
            attendanceRecordRepository.findAll().stream()
                    .filter(r -> r.getStudent() != null && studentIds.contains(r.getStudent().getId()))
                    .filter(r -> r.getStatus() == AttendanceStatus.ABSENT || r.getStatus() == AttendanceStatus.RETARD)
                    .forEach(r -> items.add(PortalNotificationDto.builder()
                            .id("att-" + r.getId())
                            .type(r.getStatus() == AttendanceStatus.ABSENT ? "ABSENCE" : "LATE")
                            .title(r.getStatus() == AttendanceStatus.ABSENT ? "Absence signalée" : "Retard signalé")
                            .body(r.getStudent().getName() + " — " + formatStatus(r.getStatus()) + " le " + r.getDate())
                            .date(r.getDate())
                            .studentName(r.getStudent().getName())
                            .build()));

            studentGradeRepository.findAll().stream()
                    .filter(g -> g.getStudent() != null && studentIds.contains(g.getStudent().getId()))
                    .forEach(g -> items.add(PortalNotificationDto.builder()
                            .id("grade-" + g.getId())
                            .type("GRADE")
                            .title("Nouvelle note publiée")
                            .body(g.getStudent().getName() + " — "
                                    + (g.getEvaluation() != null ? g.getEvaluation().getLabel() : "Évaluation")
                                    + " : " + g.getScore())
                            .date(g.getEvaluation() != null ? g.getEvaluation().getDate() : null)
                            .studentName(g.getStudent().getName())
                            .build()));
        }

        calendarEventRepository.findAll().stream()
                .forEach(e -> items.add(PortalNotificationDto.builder()
                        .id("event-" + e.getId())
                        .type("EVENT")
                        .title("Événement scolaire")
                        .body(e.getLabel() + (e.getLocation() != null ? " — " + e.getLocation() : ""))
                        .date(e.getDate())
                        .studentName(null)
                        .build()));

        paymentReminderRepository.findAll().stream()
                .filter(p -> matchesParent(p, parentName, studentNames))
                .filter(p -> p.getStatus() != PaymentStatus.PAYE)
                .forEach(p -> items.add(PortalNotificationDto.builder()
                        .id("pay-" + p.getId())
                        .type("PAYMENT")
                        .title("Rappel de paiement")
                        .body((p.getStudentName() != null ? p.getStudentName() + " — " : "")
                                + p.getAmount() + " FCFA avant le " + p.getDueDate())
                        .date(p.getDueDate())
                        .studentName(p.getStudentName())
                        .build()));

        items.sort(Comparator.comparing(
                (PortalNotificationDto n) -> n.getDate() != null ? n.getDate() : "",
                Comparator.reverseOrder()));

        return PortalNotificationsResponse.builder()
                .notifications(items)
                .build();
    }

    private boolean matchesParent(PaymentReminder reminder, String parentName, Set<String> studentNames) {
        if (parentName != null && reminder.getParentName() != null
                && reminder.getParentName().equalsIgnoreCase(parentName.trim())) {
            return true;
        }
        return reminder.getStudentName() != null && studentNames.contains(reminder.getStudentName());
    }

    private String formatStatus(AttendanceStatus status) {
        return switch (status) {
            case ABSENT -> "absent";
            case RETARD -> "en retard";
            default -> "présent";
        };
    }
}
