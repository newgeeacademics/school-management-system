package com.classroom.backend.repository;

import com.classroom.backend.model.CalendarEvent;
import com.classroom.backend.model.enums.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, String> {
    List<CalendarEvent> findByType(EventType type);
    List<CalendarEvent> findByDate(String date);
}
