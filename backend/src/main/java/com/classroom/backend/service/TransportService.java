package com.classroom.backend.service;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransportService {

    private final TransportRouteRepository transportRouteRepository;
    private final StudentRepository studentRepository;
    private final DriverRepository driverRepository;
    private final ObjectMapper objectMapper;
    private final SchoolContextService schoolContextService;

    /** Routes of the signed-in user's school (none without a school). */
    public List<TransportRoute> findAll() {
        return schoolContextService.getCurrentUserSchoolId()
                .map(transportRouteRepository::findBySchoolId)
                .orElseGet(List::of);
    }

    public TransportRoute findById(String id) {
        TransportRoute route = transportRouteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transport route not found: " + id));
        assertSameSchool(route.getSchoolId());
        return route;
    }

    public List<TransportRoute> findByStudentId(String studentId) {
        String schoolId = requireUserSchoolId();
        return transportRouteRepository.findByStudentId(studentId).stream()
                .filter(route -> schoolId.equals(route.getSchoolId()))
                .toList();
    }

    @Transactional
    public TransportRoute create(TransportRouteRequest request) {
        String schoolId = schoolContextService.requireCurrentSchoolId();
        String driverName = resolveDriverName(request);

        TransportRoute route = TransportRoute.builder()
                .schoolId(schoolId)
                .name(request.getName())
                .driverName(driverName)
                .driver(resolveDriver(request.getDriverId()))
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
            if (!request.getStudentIds().isEmpty()) {
                route.getStudents().addAll(studentsOfSchool(request.getStudentIds(), schoolId));
            }
        }

        return transportRouteRepository.save(route);
    }

    @Transactional
    public TransportRoute update(String id, TransportRouteRequest request) {
        TransportRoute route = findById(id);
        route.setName(request.getName());
        route.setDriverName(resolveDriverName(request));
        route.setDriver(resolveDriver(request.getDriverId()));
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
        List<String> ids = studentIds != null ? studentIds : List.of();

        // Mutate the managed collection in place so Hibernate deletes join-table rows.
        route.getStudents().clear();
        if (!ids.isEmpty()) {
            route.getStudents().addAll(studentsOfSchool(ids, route.getSchoolId()));
        }

        return transportRouteRepository.save(route);
    }

    @Transactional
    public void delete(String id) {
        findById(id); // school check
        transportRouteRepository.deleteById(id);
    }

    private Driver resolveDriver(String driverId) {
        if (driverId == null || driverId.isBlank()) {
            return null;
        }
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found: " + driverId));
        if (!requireUserSchoolId().equals(driver.getSchoolId())) {
            throw new IllegalArgumentException("Ce chauffeur n'appartient pas à votre établissement.");
        }
        return driver;
    }

    /** Students to put on a route: all must belong to the route's school. */
    private List<Student> studentsOfSchool(List<String> studentIds, String schoolId) {
        List<Student> students = studentRepository.findAllById(studentIds);
        boolean foreign = students.stream().anyMatch(s -> schoolId == null || !schoolId.equals(s.getSchoolId()));
        if (foreign || students.size() != new java.util.HashSet<>(studentIds).size()) {
            throw new IllegalArgumentException("Certains élèves n'appartiennent pas à votre établissement.");
        }
        return students;
    }

    private String requireUserSchoolId() {
        return schoolContextService.getCurrentUserSchoolId()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Aucun établissement associé à ce compte."));
    }

    private void assertSameSchool(String entitySchoolId) {
        if (entitySchoolId == null || !entitySchoolId.equals(requireUserSchoolId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Trajet introuvable.");
        }
    }

    private String resolveDriverName(TransportRouteRequest request) {
        if (request.getDriverId() != null && !request.getDriverId().isBlank()) {
            return resolveDriver(request.getDriverId()).getName();
        }
        if (request.getDriverName() == null || request.getDriverName().isBlank()) {
            throw new IllegalArgumentException("Driver name or driverId is required");
        }
        return request.getDriverName().trim();
    }
}
