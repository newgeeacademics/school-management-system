package com.classroom.backend.controller;

import com.classroom.backend.dto.request.EvaluationRequest;
import com.classroom.backend.dto.request.HomeworkRequest;
import com.classroom.backend.dto.request.RollCallRequest;
import com.classroom.backend.dto.request.StudentGradeRequest;
import com.classroom.backend.dto.response.PortalClassDetailResponse;
import com.classroom.backend.dto.response.PortalDirectoryResponse;
import com.classroom.backend.dto.response.PortalHomeworkResponse;
import com.classroom.backend.dto.response.PortalHomeworkResponse.PortalHomeworkDto;
import com.classroom.backend.dto.response.PortalRollCallResponse;
import com.classroom.backend.dto.response.PortalAttendanceResponse;
import com.classroom.backend.dto.response.PortalFeedResponse;
import com.classroom.backend.dto.response.PortalGradesDetailResponse;
import com.classroom.backend.dto.response.PortalGradesDetailResponse.PortalEvaluationDto;
import com.classroom.backend.dto.response.PortalGradesDetailResponse.PortalGradeEntryDto;
import com.classroom.backend.dto.request.PortalChatSendRequest;
import com.classroom.backend.dto.request.TeacherClassMessageRequest;
import com.classroom.backend.dto.response.PortalChatResponse;
import com.classroom.backend.dto.response.PortalChatResponse.PortalChatMessageDto;
import com.classroom.backend.dto.response.CommunicationResultResponse;
import com.classroom.backend.dto.response.PortalMessagesResponse;
import com.classroom.backend.dto.response.PortalNotificationsResponse;
import com.classroom.backend.service.PortalChatService;
import com.classroom.backend.service.SchoolCommunicationService;
import com.classroom.backend.model.enums.AttendanceStatus;
import com.classroom.backend.model.Announcement;
import com.classroom.backend.model.FeeInstallment;
import com.classroom.backend.service.AnnouncementService;
import com.classroom.backend.service.FeeInstallmentService;
import com.classroom.backend.service.PortalAttendanceService;
import com.classroom.backend.service.PortalClassHubService;
import com.classroom.backend.service.PortalGradeService;
import com.classroom.backend.service.PortalNotificationService;
import com.classroom.backend.service.PortalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import java.util.List;

@RestController
@RequestMapping("/api/portal")
@RequiredArgsConstructor
public class PortalController {

    private final PortalService portalService;
    private final PortalGradeService portalGradeService;
    private final PortalAttendanceService portalAttendanceService;
    private final PortalNotificationService portalNotificationService;
    private final PortalClassHubService portalClassHubService;
    private final AnnouncementService announcementService;
    private final FeeInstallmentService feeInstallmentService;
    private final SchoolCommunicationService schoolCommunicationService;
    private final PortalChatService portalChatService;

    /** Role-scoped feed: teacher → their classes/students; student → their class; parent → children. */
    @GetMapping("/feed")
    public ResponseEntity<PortalFeedResponse> feed() {
        return ResponseEntity.ok(portalService.getFeedForCurrentUser());
    }

    /** Grades & bulletin scoped to the signed-in teacher, student, or parent. */
    @GetMapping("/grades")
    public ResponseEntity<PortalGradesDetailResponse> gradesDetail(
            @RequestParam(required = false) String classId,
            @RequestParam(required = false, defaultValue = "Trimestre 1") String period,
            @RequestParam(required = false) String studentId
    ) {
        return ResponseEntity.ok(portalGradeService.getGradesDetail(classId, period, studentId));
    }

    /** Teacher only — create an evaluation for one of their classes. */
    @PostMapping("/grades/evaluations")
    public ResponseEntity<PortalEvaluationDto> createEvaluation(@Valid @RequestBody EvaluationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(portalGradeService.createEvaluation(request));
    }

    /** Teacher only — enter or update a student mark. */
    @PostMapping("/grades")
    public ResponseEntity<PortalGradeEntryDto> saveGrade(@Valid @RequestBody StudentGradeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(portalGradeService.saveGrade(request));
    }

    /** Teacher only — attach exam document (PDF, Word, etc.) for students to download. */
    @PostMapping(value = "/grades/evaluations/{id}/document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PortalEvaluationDto> uploadEvaluationDocument(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return ResponseEntity.ok(portalGradeService.uploadEvaluationDocument(id, file));
    }

    /** Teacher, student, parent — download exam document in original format. */
    @GetMapping("/grades/evaluations/{id}/document")
    public ResponseEntity<Resource> downloadEvaluationDocument(@PathVariable String id) throws IOException {
        var doc = portalGradeService.downloadEvaluationDocument(id);
        String encoded = URLEncoder.encode(doc.filename(), StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encoded)
                .body(doc.resource());
    }

    /** Attendance scoped to the signed-in parent's children or student profile. */
    @GetMapping("/attendance")
    public ResponseEntity<PortalAttendanceResponse> attendance(
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) AttendanceStatus status
    ) {
        return ResponseEntity.ok(portalAttendanceService.getAttendance(studentId, status));
    }

    /** Notifications for parents and students (absences, grades, events, payments). */
    @GetMapping("/notifications")
    public ResponseEntity<PortalNotificationsResponse> notifications() {
        return ResponseEntity.ok(portalNotificationService.getNotifications());
    }

    /** Class detail with student roster (teacher homeroom classes, parent/student child class). */
    @GetMapping("/classes/{classId}")
    public ResponseEntity<PortalClassDetailResponse> classDetail(@PathVariable String classId) {
        return ResponseEntity.ok(portalClassHubService.getClassDetail(classId));
    }

    /** Roll call sheet for a class on a given date. */
    @GetMapping("/classes/{classId}/roll-call")
    public ResponseEntity<PortalRollCallResponse> rollCall(
            @PathVariable String classId,
            @RequestParam String date
    ) {
        return ResponseEntity.ok(portalClassHubService.getRollCall(classId, date));
    }

    /** Teacher only — save attendance for a class on a date. */
    @PostMapping("/classes/roll-call")
    public ResponseEntity<PortalRollCallResponse> saveRollCall(@Valid @RequestBody RollCallRequest request) {
        return ResponseEntity.ok(portalClassHubService.saveRollCall(request));
    }

    /** Homework list for a class. */
    @GetMapping("/classes/{classId}/homework")
    public ResponseEntity<PortalHomeworkResponse> homework(@PathVariable String classId) {
        return ResponseEntity.ok(portalClassHubService.getHomework(classId));
    }

    /** Teacher only — assign homework with due date. */
    @PostMapping("/homework")
    public ResponseEntity<PortalHomeworkDto> createHomework(@Valid @RequestBody HomeworkRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(portalClassHubService.createHomework(request));
    }

    @DeleteMapping("/homework/{id}")
    public ResponseEntity<Void> deleteHomework(@PathVariable String id) {
        portalClassHubService.deleteHomework(id);
        return ResponseEntity.noContent().build();
    }

    /** Parent/student — homeroom teacher contacts for linked classes. */
    @GetMapping("/directory")
    public ResponseEntity<PortalDirectoryResponse> directory() {
        return ResponseEntity.ok(portalClassHubService.getDirectory());
    }

    /** Published official announcements for families. */
    @GetMapping("/announcements")
    public ResponseEntity<List<Announcement>> announcements() {
        return ResponseEntity.ok(announcementService.findPublished());
    }

    /** Recent live chat messages for the signed-in school community. */
    @GetMapping("/chat/messages")
    public ResponseEntity<PortalChatResponse> chatMessages() {
        return ResponseEntity.ok(PortalChatResponse.builder()
                .messages(portalChatService.getRecentMessages())
                .build());
    }

    /** Send a live chat message (also available over WebSocket type CHAT). */
    @PostMapping("/chat/messages")
    public ResponseEntity<PortalChatMessageDto> sendChatMessage(@Valid @RequestBody PortalChatSendRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(portalChatService.sendMessage(request.getBody()));
    }

    /** School messages for parents, students, and teachers (scoped by audience). */
    @GetMapping("/messages")
    public ResponseEntity<PortalMessagesResponse> messages() {
        return ResponseEntity.ok(schoolCommunicationService.getPortalMessages());
    }

    /** Teacher only — e-mail and portal message to parents of a homeroom class. */
    @PostMapping("/messages/parents")
    public ResponseEntity<CommunicationResultResponse> teacherMessageToParents(
            @Valid @RequestBody TeacherClassMessageRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                schoolCommunicationService.sendTeacherClassMessage(
                        request.getClassId(),
                        request.getSubject(),
                        request.getBody()
                )
        );
    }

    /** Fee schedule (échéancier) for families. */
    @GetMapping("/fees")
    public ResponseEntity<List<FeeInstallment>> fees(
            @RequestParam(required = false, defaultValue = "2025-2026") String academicYear
    ) {
        return ResponseEntity.ok(feeInstallmentService.findByYear(academicYear));
    }
}
