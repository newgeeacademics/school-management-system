package com.classroom.backend.dto.request;

import com.classroom.backend.model.enums.SchoolType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SchoolRequest {

    @NotBlank(message = "Name is required")
    private String name;

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
    private String registrationNumber;
    private String languagesOffered;
    private String logoFileName;
    private Double gradingScale;
    private String evaluationTypes;
    private String evaluationPeriods;
}
