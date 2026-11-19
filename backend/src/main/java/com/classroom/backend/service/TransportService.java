package com.classroom.backend.service;

import com.classroom.backend.dto.request.TransportRouteRequest;
import com.classroom.backend.model.Driver;
import com.classroom.backend.model.Student;
import com.classroom.backend.model.TransportRoute;
import com.classroom.backend.model.TransportRouteWaypoint;
import com.classroom.backend.repository.DriverRepository;
import com.classroom.backend.repository.StudentRepository;
import com.classroom.backend.repository.TransportRouteRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

/**
 * Transport routes belong to one establishment: users only see and edit their own school's routes.
 * Routes from another school answer "not found", as if they did not exist.
 */
@Service
@RequiredArgsConstructor
public class TransportService {

    static final String ROUTE_NOT_FOUND = "Trajet introuvable.";
    static final String DRIVER_NOT_FOUND = "Chauffeur introuvable dans votre établissement.";
    static final String STUDENT_OTHER_SCHOOL = "Un des élèves choisis n'appartient pas à votre établissement.";

    private final TransportRouteRepository transportRouteRepository;
    private final StudentRepository studentRepository;
    private final DriverRepository driverRepository;
    private final SchoolContextService schoolContextService;
    private final ObjectMapper objectMapper;

    public List<TransportRoute> findAll() {
        return schoolContextService.getCurrentUserSchoolId()
                .map(transportRouteRepository::findBySchoolId)
                .orElseGet(List::of);
    }

    public TransportRoute findById(String id) {
        return transportRouteRepository.findById(id)
                .filter(route -> schoolContextService.isInCurrentUserSchool(route.getSchoolId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, ROUTE_NOT_FOUND));
    }

    public List<TransportRoute> findByStudentId(String studentId) {
        return transportRouteRepository.findByStudentId(studentId).stream()
                .filter(route -> schoolContextService.isInCurrentUserSchool(route.getSchoolId()))
                .toList();
    }

    @Transactional
    public TransportRoute create(TransportRouteRequest request) {
        String schoolId = schoolContextService.requireCurrentSchoolId();
        String driverName = resolveDriverName(request, schoolId);

        TransportRoute route = TransportRoute.builder()
                .name(request.getName())
                .schoolId(schoolId)
                .driverName(driverName)
                .driver(resolveDriver(request.getDriverId(), schoolId))
                .departureTime(request.getDepartureTime())
                .returnTime(request.getReturnTime())
                .note(request.getNote())
                .waypoints(new ArrayList<>())
                .students(new ArrayList<>())
                .build();

        if (request.getWaypoints() != null) {
            for (TransportRouteRequest.WaypointDto wp : request.getWaypoints()) {
                TransportRouteWaypoint waypoint = TransportRouteWaypoint.builder()
                        .lat(wp.getLat())
                        .lng(wp.getLng())
                        .name(wp.getName())
                        .transportRoute(route)
                        .build();
                route.getWaypoints().add(waypoint);
            }
        }

        if (request.getRoutePolyline() != null) {
            try {
                route.setRoutePolylineJson(objectMapper.writeValueAsString(request.getRoutePolyline()));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize route polyline", e);
            }
        }

        if (request.getStudentIds() != null) {
            route.getStudents().clear();
            route.getStudents().addAll(resolveStudents(request.getStudentIds(), schoolId));
        }

        return transportRouteRepository.save(route);
    }

    @Transactional
    public TransportRoute update(String id, TransportRouteRequest request) {
        TransportRoute route = findById(id);
        route.setName(request.getName());
        route.setDriverName(resolveDriverName(request, route.getSchoolId()));
        route.setDriver(resolveDriver(request.getDriverId(), route.getSchoolId()));
        route.setDepartureTime(request.getDepartureTime());
        route.setReturnTime(request.getReturnTime());
        route.setNote(request.getNote());

        if (request.getWaypoints() != null) {
            route.getWaypoints().clear();
            for (TransportRouteRequest.WaypointDto wp : request.getWaypoints()) {
                TransportRouteWaypoint waypoint = TransportRouteWaypoint.builder()
                        .lat(wp.getLat())
                        .lng(wp.getLng())
                        .name(wp.getName())
                        .transportRoute(route)
                        .build();
                route.getWaypoints().add(waypoint);
            }
        }

        if (request.getRoutePolyline() != null) {
            try {
                route.setRoutePolylineJson(objectMapper.writeValueAsString(request.getRoutePolyline()));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize route polyline", e);
            }
        }

        return transportRouteRepository.save(route);
    }

    @Transactional
    public TransportRoute updateStudents(String id, List<String> studentIds) {
        TransportRoute route = findById(id);
        List<Student> students = resolveStudents(studentIds, route.getSchoolId());

        // Mutate the managed collection in place so Hibernate deletes join-table rows.
        route.getStudents().clear();
        route.getStudents().addAll(students);

        return transportRouteRepository.save(route);
    }

    @Transactional
    public void delete(String id) {
        transportRouteRepository.delete(findById(id));
    }

    private List<Student> resolveStudents(List<String> studentIds, String schoolId) {
        if (studentIds == null || studentIds.isEmpty()) {
            return new ArrayList<>();
        }
        List<Student> students = studentRepository.findAllById(studentIds);
        for (Student student : students) {
            if (student.getSchoolId() == null || !student.getSchoolId().equals(schoolId)) {
                throw new IllegalArgumentException(STUDENT_OTHER_SCHOOL);
            }
        }
        return students;
    }

    private Driver resolveDriver(String driverId, String schoolId) {
        if (driverId == null || driverId.isBlank()) {
            return null;
        }
        return driverRepository.findById(driverId)
                .filter(driver -> driver.getSchoolId() != null && driver.getSchoolId().equals(schoolId))
                .orElseThrow(() -> new IllegalArgumentException(DRIVER_NOT_FOUND));
    }

    private String resolveDriverName(TransportRouteRequest request, String schoolId) {
        if (request.getDriverId() != null && !request.getDriverId().isBlank()) {
            return resolveDriver(request.getDriverId(), schoolId).getName();
        }
        if (request.getDriverName() == null || request.getDriverName().isBlank()) {
            throw new IllegalArgumentException("Driver name or driverId is required");
        }
        return request.getDriverName().trim();
    }
}
