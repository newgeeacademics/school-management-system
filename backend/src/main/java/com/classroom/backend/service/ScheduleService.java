package com.classroom.backend.service;

import com.classroom.backend.dto.request.ScheduleItemRequest;
import com.classroom.backend.model.ClassItem;
import com.classroom.backend.model.Course;
import com.classroom.backend.model.ScheduleItem;
import com.classroom.backend.model.Teacher;
import com.classroom.backend.repository.ClassItemRepository;
import com.classroom.backend.repository.CourseRepository;
import com.classroom.backend.repository.ScheduleItemRepository;
import com.classroom.backend.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleItemRepository scheduleItemRepository;
    private final ClassItemRepository classItemRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;

    public List<ScheduleItem> findAll() {
        return scheduleItemRepository.findAll();
    }

    public ScheduleItem findById(String id) {
        return scheduleItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule item not found: " + id));
    }

    public List<ScheduleItem> findByClassId(String classId) {
        return scheduleItemRepository.findByClassItemId(classId);
    }

    public List<ScheduleItem> findByDay(String day) {
        return scheduleItemRepository.findByDay(day);
    }

    @Transactional
    public ScheduleItem create(ScheduleItemRequest request) {
        ClassItem classItem = classItemRepository.findById(request.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found: " + request.getClassId()));

        Course course = null;
        if (request.getCourseId() != null && !request.getCourseId().isBlank()) {
            course = courseRepository.findById(request.getCourseId()).orElse(null);
        }

        ScheduleItem item = ScheduleItem.builder()
                .classItem(classItem)
                .course(course)
                .teacher(resolveTeacher(request.getTeacherId()))
                .day(request.getDay())
                .time(request.getTime())
                .room(request.getRoom())
                .build();

        return scheduleItemRepository.save(item);
    }

    @Transactional
    public ScheduleItem update(String id, ScheduleItemRequest request) {
        ScheduleItem item = findById(id);

        ClassItem classItem = classItemRepository.findById(request.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found: " + request.getClassId()));
        item.setClassItem(classItem);

        if (request.getCourseId() != null && !request.getCourseId().isBlank()) {
            Course course = courseRepository.findById(request.getCourseId()).orElse(null);
            item.setCourse(course);
        } else {
            item.setCourse(null);
        }

        item.setTeacher(resolveTeacher(request.getTeacherId()));

        item.setDay(request.getDay());
        item.setTime(request.getTime());
        item.setRoom(request.getRoom());

        return scheduleItemRepository.save(item);
    }

    @Transactional
    public void delete(String id) {
        scheduleItemRepository.deleteById(id);
    }

    private Teacher resolveTeacher(String teacherId) {
        if (teacherId == null || teacherId.isBlank()) {
            return null;
        }
        return teacherRepository.findById(teacherId).orElse(null);
    }
}
