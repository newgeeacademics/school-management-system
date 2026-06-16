package com.classroom.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class TransportRouteRequest {

    @NotBlank(message = "Name is required")
    private String name;

  private String driverName;

    private String driverId;

    @NotBlank(message = "Departure time is required")
    private String departureTime;

    private String returnTime;
    private String note;
    private List<WaypointDto> waypoints;
    private List<double[]> routePolyline;
    private List<String> studentIds;

    @Data
    public static class WaypointDto {
        private Double lat;
        private Double lng;
        private String name;
    }
}
