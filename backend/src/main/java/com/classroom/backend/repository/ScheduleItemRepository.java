package com.classroom.backend.repository;

import com.classroom.backend.model.ScheduleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleItemRepository extends JpaRepository<ScheduleItem, String> {
    List<ScheduleItem> findByClassItemId(String classId);
    List<ScheduleItem> findByDay(String day);
    List<ScheduleItem> findByCourseId(String courseId);
}
