package com.classroom.backend.model;

import com.classroom.backend.model.enums.SchoolType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "schools")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class School {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private SchoolType type;

    private String system;
    private String country;
    private String city;
    private String district;
    private String address;
    private String gps;
    private String mainPhone;
    private String officialEmail;
    private String headName;
    private String headPhone;
    private String website;
    private Integer studentCount;
    private Integer teacherCount;
    private String series;
    private String logoFileName;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
