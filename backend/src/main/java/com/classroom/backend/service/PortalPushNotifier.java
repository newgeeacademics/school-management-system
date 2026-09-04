package com.classroom.backend.service;

import com.classroom.backend.model.ParentContact;
import com.classroom.backend.model.Student;
import com.classroom.backend.repository.ParentContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PortalPushNotifier {

    private final WebPushService webPushService;
    private final ParentContactRepository parentContactRepository;

    public void notifyStudentFamily(Student student, String title, String body, String portalPath, String tag) {
        if (student == null) {
            return;
        }
        Set<String> userIds = familyUserIds(student);
        webPushService.sendToUsers(userIds, title, body, portalPath, tag);
    }

    public void notifyParentByName(String parentName, String title, String body, String portalPath, String tag) {
        if (parentName == null || parentName.isBlank()) {
            return;
        }
        String normalized = parentName.trim().toLowerCase();
        Set<String> userIds = new LinkedHashSet<>();
        for (ParentContact parent : parentContactRepository.findByNameIgnoreCase(normalized)) {
            if (parent.getAppUser() != null) {
                userIds.add(parent.getAppUser().getId());
            }
        }
        webPushService.sendToUsers(userIds, title, body, portalPath, tag);
    }

    public void notifyUsers(Collection<String> appUserIds, String title, String body, String portalPath, String tag) {
        webPushService.sendToUsers(appUserIds, title, body, portalPath, tag);
    }

    public void notifyStudentsOnRoute(
            Collection<Student> students,
            String title,
            String body,
            String path,
            String tag
    ) {
        if (students == null || students.isEmpty()) {
            return;
        }
        Set<String> userIds = new LinkedHashSet<>();
        for (Student student : students) {
            userIds.addAll(familyUserIds(student));
        }
        webPushService.sendToUsers(userIds, title, body, path, tag);
    }

    private Set<String> familyUserIds(Student student) {
        Set<String> userIds = new LinkedHashSet<>();
        if (student.getAppUser() != null) {
            userIds.add(student.getAppUser().getId());
        }
        List<ParentContact> parents = parentContactRepository.findByStudentId(student.getId());
        for (ParentContact parent : parents) {
            if (parent.getAppUser() != null) {
                userIds.add(parent.getAppUser().getId());
            }
        }
        return userIds;
    }
}
