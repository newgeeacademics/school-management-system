package com.classroom.backend.service;

import com.classroom.backend.dto.request.CanteenMenuItemRequest;
import com.classroom.backend.model.CanteenMenuItem;
import com.classroom.backend.repository.CanteenMenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CanteenService {

    private final CanteenMenuItemRepository canteenMenuItemRepository;

    public List<CanteenMenuItem> findAll() {
        return canteenMenuItemRepository.findAll();
    }

    public CanteenMenuItem findById(String id) {
        return canteenMenuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Canteen menu item not found: " + id));
    }

    public List<CanteenMenuItem> findByDay(String day) {
        return canteenMenuItemRepository.findByDay(day);
    }

    @Transactional
    public CanteenMenuItem create(CanteenMenuItemRequest request) {
        CanteenMenuItem item = CanteenMenuItem.builder()
                .day(request.getDay())
                .mealType(request.getMealType())
                .dish(request.getDish())
                .note(request.getNote())
                .build();
        return canteenMenuItemRepository.save(item);
    }

    @Transactional
    public CanteenMenuItem update(String id, CanteenMenuItemRequest request) {
        CanteenMenuItem item = findById(id);
        item.setDay(request.getDay());
        item.setMealType(request.getMealType());
        item.setDish(request.getDish());
        item.setNote(request.getNote());
        return canteenMenuItemRepository.save(item);
    }

    @Transactional
    public void delete(String id) {
        canteenMenuItemRepository.deleteById(id);
    }
}
