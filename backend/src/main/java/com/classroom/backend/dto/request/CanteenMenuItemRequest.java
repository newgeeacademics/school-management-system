package com.classroom.backend.dto.request;

import com.classroom.backend.model.enums.MealType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CanteenMenuItemRequest {

    @NotBlank(message = "Day is required")
    private String day;

    @NotNull(message = "Meal type is required")
    private MealType mealType;

    @NotBlank(message = "Dish is required")
    private String dish;

    private String note;
}
