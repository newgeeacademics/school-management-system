package com.classroom.backend.repository;

import com.classroom.backend.model.CanteenMenuItem;
import com.classroom.backend.model.enums.MealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CanteenMenuItemRepository extends JpaRepository<CanteenMenuItem, String> {
    List<CanteenMenuItem> findByDay(String day);
    List<CanteenMenuItem> findByMealType(MealType mealType);
}
