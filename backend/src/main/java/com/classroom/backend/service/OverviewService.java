package com.classroom.backend.service;

import com.classroom.backend.dto.response.OverviewResponse;
import com.classroom.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OverviewService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ClassItemRepository classItemRepository;
    private final CourseRepository courseRepository;
    private final RoomRepository roomRepository;
    private final ParentContactRepository parentContactRepository;
    private final CalendarEventRepository calendarEventRepository;

    public OverviewResponse getOverview() {
        return OverviewResponse.builder()
                .totalStudents(studentRepository.count())
                .totalTeachers(teacherRepository.count())
                .totalClasses(classItemRepository.count())
                .totalCourses(courseRepository.count())
                .totalRooms(roomRepository.count())
                .totalParents(parentContactRepository.count())
                .upcomingEvents(calendarEventRepository.count())
                .build();
    }
}
