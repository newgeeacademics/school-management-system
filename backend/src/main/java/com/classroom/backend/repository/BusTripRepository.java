package com.classroom.backend.repository;

import com.classroom.backend.model.BusTrip;
import com.classroom.backend.model.enums.BusTripStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BusTripRepository extends JpaRepository<BusTrip, String> {

    Optional<BusTrip> findFirstByTransportRoute_IdAndStatusOrderByStartedAtDesc(
            String routeId, BusTripStatus status);

    List<BusTrip> findByTransportRoute_IdInAndStatus(List<String> routeIds, BusTripStatus status);
}
