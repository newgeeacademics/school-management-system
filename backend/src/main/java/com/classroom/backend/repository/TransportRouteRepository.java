package com.classroom.backend.repository;

import com.classroom.backend.model.TransportRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportRouteRepository extends JpaRepository<TransportRoute, String> {

    @Query("SELECT tr FROM TransportRoute tr JOIN tr.students s WHERE s.id = :studentId")
    List<TransportRoute> findByStudentId(@Param("studentId") String studentId);

    List<TransportRoute> findByDriver_Id(String driverId);
}
