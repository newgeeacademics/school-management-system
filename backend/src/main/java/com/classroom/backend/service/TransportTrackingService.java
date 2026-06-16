package com.classroom.backend.service;

import com.classroom.backend.dto.request.PositionUpdateRequest;
import com.classroom.backend.dto.response.LiveTrackingResponse;
import com.classroom.backend.dto.response.LiveTrackingResponse.*;
import com.classroom.backend.model.*;
import com.classroom.backend.model.enums.BusTripStatus;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.portal.PortalRealtimeBroadcaster;
import com.classroom.backend.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransportTrackingService {

    private final AppUserRepository appUserRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final ParentContactRepository parentContactRepository;
    private final ClassItemRepository classItemRepository;
    private final TransportRouteRepository transportRouteRepository;
    private final BusTripRepository busTripRepository;
    private final DriverRepository driverRepository;
    private final ObjectMapper objectMapper;
    private final PortalRealtimeBroadcaster realtimeBroadcaster;

    @Transactional(readOnly = true)
    public List<LiveTrackingResponse> getLiveRoutesForCurrentUser() {
        AppUser user = resolveCurrentUser();
        if (user.getRole() == UserRole.STAFF) {
            return driverRepository.findByAppUser_Id(user.getId())
                    .map(driver -> transportRouteRepository.findAll().stream()
                            .filter(route -> route.getDriver() != null
                                    && driver.getId().equals(route.getDriver().getId()))
                            .map(route -> toLiveResponse(route, Set.of()))
                            .toList())
                    .orElse(List.of());
        }

        Set<String> studentIds = resolveScopedStudentIds();
        if (studentIds.isEmpty()) {
            return List.of();
        }

        return transportRouteRepository.findAll().stream()
                .filter(route -> route.getStudents() != null && route.getStudents().stream()
                        .anyMatch(s -> studentIds.contains(s.getId())))
                .map(route -> toLiveResponse(route, studentIds))
                .toList();
    }

    @Transactional(readOnly = true)
    public LiveTrackingResponse getLiveRoute(String routeId) {
        TransportRoute route = transportRouteRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Transport route not found: " + routeId));

        Set<String> studentIds = resolveScopedStudentIds();
        boolean allowed = route.getStudents() != null && route.getStudents().stream()
                .anyMatch(s -> studentIds.contains(s.getId()));

        AppUser user = resolveCurrentUser();
        if (!allowed && user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.STAFF) {
            throw new RuntimeException("Access denied to this route");
        }
        if (user.getRole() == UserRole.STAFF) {
            boolean isAssignedDriver = driverRepository.findByAppUser_Id(user.getId())
                    .map(driver -> route.getDriver() != null && driver.getId().equals(route.getDriver().getId()))
                    .orElse(false);
            if (!isAssignedDriver) {
                throw new RuntimeException("Access denied to this route");
            }
        }

        return toLiveResponse(route, studentIds);
    }

    @Transactional
    public LiveTrackingResponse startTrip(String routeId) {
        TransportRoute route = transportRouteRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Transport route not found: " + routeId));

        busTripRepository.findFirstByTransportRoute_IdAndStatusOrderByStartedAtDesc(routeId, BusTripStatus.ACTIVE)
                .ifPresent(existing -> {
                    existing.setStatus(BusTripStatus.COMPLETED);
                    existing.setCompletedAt(Instant.now());
                    busTripRepository.save(existing);
                });

        BusTrip trip = BusTrip.builder()
                .transportRoute(route)
                .status(BusTripStatus.ACTIVE)
                .startedAt(Instant.now())
                .build();
        busTripRepository.save(trip);

        return toLiveResponse(route, Set.of());
    }

    @Transactional
    public LiveTrackingResponse updatePosition(String routeId, PositionUpdateRequest request) {
        TransportRoute route = transportRouteRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Transport route not found: " + routeId));

        BusTrip trip = busTripRepository.findFirstByTransportRoute_IdAndStatusOrderByStartedAtDesc(routeId, BusTripStatus.ACTIVE)
                .orElseGet(() -> {
                    BusTrip newTrip = BusTrip.builder()
                            .transportRoute(route)
                            .status(BusTripStatus.ACTIVE)
                            .startedAt(Instant.now())
                            .build();
                    return busTripRepository.save(newTrip);
                });

        Instant now = Instant.now();
        trip.setCurrentLat(request.getLat());
        trip.setCurrentLng(request.getLng());
        trip.setHeading(request.getHeading());
        trip.setSpeedKmh(request.getSpeedKmh());
        trip.setLastPositionAt(now);
        busTripRepository.save(trip);

        realtimeBroadcaster.broadcastLocationUpdate(routeId, request.getLat(), request.getLng(), now);

        return toLiveResponse(route, Set.of());
    }

    @Transactional
    public LiveTrackingResponse stopTrip(String routeId) {
        TransportRoute route = transportRouteRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Transport route not found: " + routeId));

        busTripRepository.findFirstByTransportRoute_IdAndStatusOrderByStartedAtDesc(routeId, BusTripStatus.ACTIVE)
                .ifPresent(trip -> {
                    trip.setStatus(BusTripStatus.COMPLETED);
                    trip.setCompletedAt(Instant.now());
                    busTripRepository.save(trip);
                });

        return toLiveResponse(route, Set.of());
    }

    private LiveTrackingResponse toLiveResponse(TransportRoute route, Set<String> scopedStudentIds) {
        List<WaypointDto> waypoints = route.getWaypoints() == null ? List.of() :
                route.getWaypoints().stream()
                        .map(wp -> WaypointDto.builder()
                                .id(wp.getId())
                                .name(wp.getName())
                                .lat(wp.getLat())
                                .lng(wp.getLng())
                                .build())
                        .toList();

        List<double[]> polyline = parsePolyline(route.getRoutePolylineJson());

        Map<String, String> classNames = classItemRepository.findAll().stream()
                .collect(Collectors.toMap(ClassItem::getId, ClassItem::getName, (a, b) -> a));

        Optional<BusTrip> activeTrip = busTripRepository
                .findFirstByTransportRoute_IdAndStatusOrderByStartedAtDesc(route.getId(), BusTripStatus.ACTIVE);

        List<StudentOnRouteDto> students = route.getStudents() == null ? List.of() :
                route.getStudents().stream()
                        .filter(s -> scopedStudentIds.isEmpty() || scopedStudentIds.contains(s.getId()))
                        .map(s -> buildStudentOnRoute(s, classNames, route, activeTrip.orElse(null)))
                        .toList();

        LivePositionDto livePosition = null;
        LivePositionDto driverPosition = null;
        String tripStatus = "INACTIVE";
        if (activeTrip.isPresent()) {
            BusTrip trip = activeTrip.get();
            tripStatus = trip.getStatus().name();
            if (trip.getCurrentLat() != null && trip.getCurrentLng() != null) {
                livePosition = LivePositionDto.builder()
                        .lat(trip.getCurrentLat())
                        .lng(trip.getCurrentLng())
                        .heading(trip.getHeading())
                        .speedKmh(trip.getSpeedKmh())
                        .recordedAt(trip.getLastPositionAt() != null ? trip.getLastPositionAt().toString() : null)
                        .build();
                driverPosition = livePosition;
            }
        }

        // Rebuild students with live positions when trip is active
        if (activeTrip.isPresent() && livePosition != null) {
            final LivePositionDto busPos = livePosition;
            students = route.getStudents() == null ? List.of() :
                    route.getStudents().stream()
                            .filter(s -> scopedStudentIds.isEmpty() || scopedStudentIds.contains(s.getId()))
                            .map(s -> StudentOnRouteDto.builder()
                                    .id(s.getId())
                                    .name(s.getName())
                                    .className(s.getClassItem() != null
                                            ? classNames.getOrDefault(s.getClassItem().getId(), "")
                                            : "")
                                    .lat(busPos.getLat())
                                    .lng(busPos.getLng())
                                    .trackingStatus("ON_BUS")
                                    .build())
                            .toList();
        }

        return LiveTrackingResponse.builder()
                .routeId(route.getId())
                .routeName(route.getName())
                .driverName(route.getDriverName())
                .departureTime(route.getDepartureTime())
                .returnTime(route.getReturnTime())
                .waypoints(waypoints)
                .routePolyline(polyline)
                .students(students)
                .livePosition(livePosition)
                .driverPosition(driverPosition)
                .tripStatus(tripStatus)
                .build();
    }

    private StudentOnRouteDto buildStudentOnRoute(
            Student s, Map<String, String> classNames, TransportRoute route, BusTrip activeTrip) {
        double[] pickup = resolveStudentPickup(route, s.getId());
        return StudentOnRouteDto.builder()
                .id(s.getId())
                .name(s.getName())
                .className(s.getClassItem() != null
                        ? classNames.getOrDefault(s.getClassItem().getId(), "")
                        : "")
                .lat(pickup != null ? pickup[0] : null)
                .lng(pickup != null ? pickup[1] : null)
                .trackingStatus(activeTrip != null ? "ON_BUS" : "WAITING")
                .build();
    }

    private double[] resolveStudentPickup(TransportRoute route, String studentId) {
        List<TransportRouteWaypoint> waypoints = route.getWaypoints();
        if (waypoints == null || waypoints.isEmpty()) {
            return null;
        }
        List<Student> students = route.getStudents();
        if (students == null || students.isEmpty()) {
            TransportRouteWaypoint wp = waypoints.get(0);
            return new double[]{wp.getLat(), wp.getLng()};
        }
        int index = 0;
        for (int i = 0; i < students.size(); i++) {
            if (studentId.equals(students.get(i).getId())) {
                index = i;
                break;
            }
        }
        TransportRouteWaypoint wp = waypoints.get(index % waypoints.size());
        return new double[]{wp.getLat(), wp.getLng()};
    }

    private List<double[]> parsePolyline(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            List<List<Double>> raw = objectMapper.readValue(json, new TypeReference<>() {});
            return raw.stream()
                    .filter(p -> p != null && p.size() >= 2)
                    .map(p -> new double[]{p.get(0), p.get(1)})
                    .toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    private Set<String> resolveScopedStudentIds() {
        AppUser user = resolveCurrentUser();
        List<Student> students = new ArrayList<>();

        switch (user.getRole()) {
            case TEACHER -> {
                Teacher teacher = teacherRepository.findByAppUser_Id(user.getId())
                        .or(() -> teacherRepository.findByEmailIgnoreCase(user.getEmail()))
                        .orElseThrow(() -> new IllegalStateException("Teacher profile not found"));
                for (ClassItem clazz : classItemRepository.findByHomeroomTeacherId(teacher.getId())) {
                    students.addAll(studentRepository.findByClassItemId(clazz.getId()));
                }
            }
            case PARENT -> {
                List<ParentContact> contacts = parentContactRepository.findByAppUser_Id(user.getId())
                        .map(List::of)
                        .orElseGet(() -> parentContactRepository.findByEmailIgnoreCase(user.getEmail()));
                for (ParentContact contact : contacts) {
                    if (contact.getStudent() != null) {
                        students.add(contact.getStudent());
                    }
                }
            }
            case STUDENT -> {
                studentRepository.findByAppUser_Id(user.getId())
                        .or(() -> studentRepository.findByEmailIgnoreCase(user.getEmail()))
                        .ifPresent(students::add);
            }
            case ADMIN, STAFF -> {
                return studentRepository.findAll().stream()
                        .map(Student::getId)
                        .collect(Collectors.toSet());
            }
            default -> throw new IllegalArgumentException("Tracking not available for role: " + user.getRole());
        }

        return students.stream().map(Student::getId).collect(Collectors.toSet());
    }

    private AppUser resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new IllegalStateException("Not authenticated");
        }
        return appUserRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }
}
