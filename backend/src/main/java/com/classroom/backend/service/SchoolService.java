package com.classroom.backend.service;

import com.classroom.backend.dto.request.SchoolRequest;
import com.classroom.backend.model.School;
import com.classroom.backend.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SchoolService {

    private final SchoolRepository schoolRepository;

    public List<School> findAll() {
        return schoolRepository.findAll();
    }

    public School findById(String id) {
        return schoolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("School not found: " + id));
    }

    @Transactional
    public School create(SchoolRequest request) {
        School school = School.builder()
                .name(request.getName())
                .type(request.getType())
                .system(request.getSystem())
                .country(request.getCountry())
                .city(request.getCity())
                .district(request.getDistrict())
                .address(request.getAddress())
                .gps(request.getGps())
                .mainPhone(request.getMainPhone())
                .officialEmail(request.getOfficialEmail())
                .headName(request.getHeadName())
                .headPhone(request.getHeadPhone())
                .website(request.getWebsite())
                .studentCount(request.getStudentCount())
                .teacherCount(request.getTeacherCount())
                .series(request.getSeries())
                .registrationNumber(request.getRegistrationNumber())
                .languagesOffered(request.getLanguagesOffered())
                .logoFileName(request.getLogoFileName())
                .build();
        return schoolRepository.save(school);
    }

    @Transactional
    public School update(String id, SchoolRequest request) {
        School school = findById(id);
        school.setName(request.getName());
        school.setType(request.getType());
        school.setSystem(request.getSystem());
        school.setCountry(request.getCountry());
        school.setCity(request.getCity());
        school.setDistrict(request.getDistrict());
        school.setAddress(request.getAddress());
        school.setGps(request.getGps());
        school.setMainPhone(request.getMainPhone());
        school.setOfficialEmail(request.getOfficialEmail());
        school.setHeadName(request.getHeadName());
        school.setHeadPhone(request.getHeadPhone());
        school.setWebsite(request.getWebsite());
        school.setStudentCount(request.getStudentCount());
        school.setTeacherCount(request.getTeacherCount());
        school.setSeries(request.getSeries());
        school.setRegistrationNumber(request.getRegistrationNumber());
        school.setLanguagesOffered(request.getLanguagesOffered());
        school.setLogoFileName(request.getLogoFileName());
        return schoolRepository.save(school);
    }

    @Transactional
    public void delete(String id) {
        schoolRepository.deleteById(id);
    }
}
