package com.classroom.backend.model;

import com.classroom.backend.model.enums.MealType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "canteen_menu_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CanteenMenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String day;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MealType mealType;

    @Column(nullable = false)
    private String dish;

    private String note;
}
