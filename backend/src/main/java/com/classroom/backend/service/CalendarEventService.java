package com.classroom.backend.service;

import com.classroom.backend.dto.request.CalendarEventRequest;
import com.classroom.backend.model.CalendarEvent;
import com.classroom.backend.repository.CalendarEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CalendarEventService {

    private final CalendarEventRepository calendarEventRepository;

    public List<CalendarEvent> findAll() {
        return calendarEventRepository.findAll();
    }

    public CalendarEvent findById(String id) {
        return calendarEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Calendar event not found: " + id));
    }

    public List<CalendarEvent> findByDate(String date) {
        return calendarEventRepository.findByDate(date);
    }

    @Transactional
    public CalendarEvent create(CalendarEventRequest request) {
        CalendarEvent event = CalendarEvent.builder()
                .label(request.getLabel())
                .date(request.getDate())
                .time(request.getTime())
                .location(request.getLocation())
                .type(request.getType())
                .build();
        return calendarEventRepository.save(event);
    }

    @Transactional
    public CalendarEvent update(String id, CalendarEventRequest request) {
        CalendarEvent event = findById(id);
        event.setLabel(request.getLabel());
        event.setDate(request.getDate());
        event.setTime(request.getTime());
        event.setLocation(request.getLocation());
        event.setType(request.getType());
        return calendarEventRepository.save(event);
    }

    @Transactional
    public void delete(String id) {
        calendarEventRepository.deleteById(id);
    }
}
