package com.classroom.backend.service;

import com.classroom.backend.dto.response.PlatformDailyReportSnapshot;
import com.classroom.backend.dto.response.PlatformDailyReportSnapshot.SchoolLine;
import com.classroom.backend.model.School;
import com.classroom.backend.model.enums.BusTripStatus;
import com.classroom.backend.model.enums.PaymentStatus;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.*;
import com.classroom.backend.service.email.EmailService;
import com.classroom.backend.service.email.templates.PlatformDailyReportEmailTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlatformDailyReportService {

    private static final ZoneId GMT = ZoneId.of("GMT");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final SchoolRepository schoolRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ParentContactRepository parentContactRepository;
    private final ClassItemRepository classItemRepository;
    private final CourseRepository courseRepository;
    private final RoomRepository roomRepository;
    private final TransportRouteRepository transportRouteRepository;
    private final DriverRepository driverRepository;
    private final AppUserRepository appUserRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final PaymentReminderRepository paymentReminderRepository;
    private final BusTripRepository busTripRepository;
    private final EmailService emailService;

    @Value("${app.reports.daily.enabled:false}")
    private boolean dailyReportEnabled;

    @Value("${app.reports.daily.recipient:newgeeacademics@gmail.com}")
    private String dailyReportRecipient;

    @Transactional(readOnly = true)
    public PlatformDailyReportSnapshot buildSnapshot() {
        ZonedDateTime now = ZonedDateTime.now(GMT);
        LocalDateTime since24h = now.minusHours(24).toLocalDateTime();
        String yesterday = LocalDate.now(GMT).minusDays(1).toString();

        List<SchoolLine> schoolLines = schoolRepository.findAll().stream()
                .sorted(Comparator.comparing(School::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(25)
                .map(s -> SchoolLine.builder()
                        .name(s.getName())
                        .city(s.getCity())
                        .country(s.getCountry())
                        .createdAt(s.getCreatedAt() != null
                                ? s.getCreatedAt().atZone(GMT).format(DATE_FMT) + " GMT"
                                : "—")
                        .build())
                .toList();

        return PlatformDailyReportSnapshot.builder()
                .generatedAt(now)
                .emailConfigured(emailService.isConfigured())
                .totalSchools(schoolRepository.count())
                .schoolsRegisteredLast24h(schoolRepository.countByCreatedAtAfter(since24h))
                .totalStudents(studentRepository.count())
                .totalTeachers(teacherRepository.count())
                .totalParents(parentContactRepository.count())
                .totalClasses(classItemRepository.count())
                .totalCourses(courseRepository.count())
                .totalRooms(roomRepository.count())
                .totalTransportRoutes(transportRouteRepository.count())
                .totalDrivers(driverRepository.count())
                .totalAdmins(appUserRepository.countByRole(UserRole.ADMIN))
                .totalPortalTeachers(appUserRepository.countByRole(UserRole.TEACHER))
                .totalPortalStudents(appUserRepository.countByRole(UserRole.STUDENT))
                .totalPortalParents(appUserRepository.countByRole(UserRole.PARENT))
                .totalStaffUsers(appUserRepository.countByRole(UserRole.STAFF))
                .attendanceRecordsYesterday(attendanceRecordRepository.countByDate(yesterday))
                .paymentRemindersPending(paymentReminderRepository.countByStatus(PaymentStatus.EN_ATTENTE))
                .activeBusTrips(busTripRepository.countByStatus(BusTripStatus.ACTIVE))
                .schools(schoolLines)
                .build();
    }

    public void sendDailyReportIfEnabled() {
        if (!dailyReportEnabled) {
            log.debug("Daily platform report skipped (disabled)");
            return;
        }
        if (dailyReportRecipient == null || dailyReportRecipient.isBlank()) {
            log.warn("Daily platform report skipped: no recipient configured");
            return;
        }
        if (!emailService.isConfigured()) {
            log.warn("Daily platform report skipped: email not configured");
            return;
        }

        try {
            PlatformDailyReportSnapshot snapshot = buildSnapshot();
            String subject = PlatformDailyReportEmailTemplate.subject(snapshot);
            String html = PlatformDailyReportEmailTemplate.html(
                    snapshot,
                    emailService.getPublicMainUrlNormalized(),
                    emailService.resolveEmailLogoUrl()
            );
            emailService.sendHtmlEmail(dailyReportRecipient.trim(), subject, html);
            log.info("Daily platform report sent to {}", dailyReportRecipient.trim());
        } catch (Exception e) {
            log.error("Failed to send daily platform report to {}", dailyReportRecipient, e);
        }
    }
}
