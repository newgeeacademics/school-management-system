package com.classroom.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "teachers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    private String firstName;

    private String lastName;

    private String initials;

    /** Optional badge / staff card number. */
    @Column(unique = true)
    private String staffId;

    @Column(nullable = false)
    private String subject;

    private String email;

    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_user_id")
    private AppUser appUser;

    @Column(name = "school_id")
    private String schoolId;

    /** Classes where this teacher teaches (subject teacher, not necessarily homeroom). */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "teacher_assigned_classes",
            joinColumns = @JoinColumn(name = "teacher_id"),
            inverseJoinColumns = @JoinColumn(name = "class_id")
    )
    @Builder.Default
    @JsonIgnore
    private Set<ClassItem> assignedClasses = new HashSet<>();

    @JsonProperty("assignedClassIds")
    public List<String> getAssignedClassIds() {
        if (assignedClasses == null || assignedClasses.isEmpty()) {
            return List.of();
        }
        return assignedClasses.stream().map(ClassItem::getId).sorted().toList();
    }
}
