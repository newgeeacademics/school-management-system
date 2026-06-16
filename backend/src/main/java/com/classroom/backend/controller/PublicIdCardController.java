package com.classroom.backend.controller;

import com.classroom.backend.dto.response.StudentIdCardResponse;
import com.classroom.backend.dto.response.TeacherIdCardResponse;
import com.classroom.backend.service.StudentIdCardService;
import com.classroom.backend.service.TeacherIdCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/id-card")
@RequiredArgsConstructor
public class PublicIdCardController {

    private final StudentIdCardService studentIdCardService;
    private final TeacherIdCardService teacherIdCardService;

    @GetMapping("/students/{id}")
    public ResponseEntity<StudentIdCardResponse> studentCard(@PathVariable String id) {
        StudentIdCardResponse card = studentIdCardService.getIdCard(id);
        card.setQrPayload(null);
        return ResponseEntity.ok(card);
    }

    @GetMapping("/teachers/{id}")
    public ResponseEntity<TeacherIdCardResponse> teacherCard(@PathVariable String id) {
        TeacherIdCardResponse card = teacherIdCardService.getIdCard(id);
        card.setQrPayload(null);
        return ResponseEntity.ok(card);
    }
}
