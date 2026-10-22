package com.classroom.backend.repository;

import com.classroom.backend.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, String> {
    List<Announcement> findByPublishedTrueOrderByPublishedAtDesc();
    List<Announcement> findAllByOrderByPublishedAtDesc();
    List<Announcement> findBySchoolIdOrderByPublishedAtDesc(String schoolId);
    List<Announcement> findBySchoolIdInAndPublishedTrueOrderByPublishedAtDesc(java.util.Collection<String> schoolIds);
}
