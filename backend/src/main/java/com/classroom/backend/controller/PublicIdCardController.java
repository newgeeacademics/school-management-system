package com.classroom.backend.controller;

import com.classroom.backend.dto.response.PublicStudentCardResponse;
import com.classroom.backend.dto.response.PublicTeacherCardResponse;
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
    public ResponseEntity<PublicStudentCardResponse> studentCard(@PathVariable String id) {
        return ResponseEntity.ok(studentIdCardService.getPublicStudentCard(id));
    }

    @GetMapping("/teachers/{id}")
    public ResponseEntity<PublicTeacherCardResponse> teacherCard(@PathVariable String id) {
        return ResponseEntity.ok(teacherIdCardService.getPublicTeacherCard(id));
    }
}
