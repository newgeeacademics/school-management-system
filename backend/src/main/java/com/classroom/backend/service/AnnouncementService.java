package com.classroom.backend.service;

import com.classroom.backend.dto.request.AnnouncementRequest;
import com.classroom.backend.model.Announcement;
import com.classroom.backend.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public List<Announcement> findAll() {
        return announcementRepository.findAllByOrderByPublishedAtDesc();
    }

    public List<Announcement> findPublished() {
        return announcementRepository.findByPublishedTrueOrderByPublishedAtDesc();
    }

    public Announcement findById(String id) {
        return announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found: " + id));
    }

    @Transactional
    public Announcement create(AnnouncementRequest request) {
        Announcement announcement = Announcement.builder()
                .title(request.getTitle().trim())
                .body(request.getBody().trim())
                .eventDate(request.getEventDate())
                .location(request.getLocation())
                .published(request.isPublished())
                .publishedAt(Instant.now())
                .build();
        return announcementRepository.save(announcement);
    }

    @Transactional
    public Announcement update(String id, AnnouncementRequest request) {
        Announcement announcement = findById(id);
        announcement.setTitle(request.getTitle().trim());
        announcement.setBody(request.getBody().trim());
        announcement.setEventDate(request.getEventDate());
        announcement.setLocation(request.getLocation());
        announcement.setPublished(request.isPublished());
        if (request.isPublished() && announcement.getPublishedAt() == null) {
            announcement.setPublishedAt(Instant.now());
        }
        return announcementRepository.save(announcement);
    }

    @Transactional
    public void delete(String id) {
        announcementRepository.deleteById(id);
    }
}
