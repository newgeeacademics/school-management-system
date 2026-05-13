package com.classroom.backend.service;

import com.classroom.backend.dto.request.TransportRouteRequest;
import com.classroom.backend.model.Student;
import com.classroom.backend.model.TransportRoute;
import com.classroom.backend.model.TransportRouteWaypoint;
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
    private final ObjectMapper objectMapper;

    public List<TransportRoute> findAll() {
        return transportRouteRepository.findAll();
    }

    public TransportRoute findById(String id) {
        return transportRouteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transport route not found: " + id));
    }

    public List<TransportRoute> findByStudentId(String studentId) {
        return transportRouteRepository.findByStudentId(studentId);
    }

    @Transactional
    public TransportRoute create(TransportRouteRequest request) {
        TransportRoute route = TransportRoute.builder()
                .name(request.getName())
                .driverName(request.getDriverName())
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
            List<Student> students = studentRepository.findAllById(request.getStudentIds());
            route.setStudents(students);
        }

        return transportRouteRepository.save(route);
    }

    @Transactional
    public TransportRoute update(String id, TransportRouteRequest request) {
        TransportRoute route = findById(id);
        route.setName(request.getName());
        route.setDriverName(request.getDriverName());
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
        List<Student> students = studentRepository.findAllById(studentIds);
        route.setStudents(students);
        return transportRouteRepository.save(route);
    }

    @Transactional
    public void delete(String id) {
        transportRouteRepository.deleteById(id);
    }
}
