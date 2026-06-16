package com.classroom.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiveTrackingResponse {

    private String routeId;
    private String routeName;
    private String driverName;
    private String departureTime;
    private String returnTime;
    private List<WaypointDto> waypoints;
    private List<double[]> routePolyline;
    private List<StudentOnRouteDto> students;
    private LivePositionDto livePosition;
    private LivePositionDto driverPosition;
    private String tripStatus;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WaypointDto {
        private String id;
        private String name;
        private double lat;
        private double lng;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentOnRouteDto {
        private String id;
        private String name;
        private String className;
        private Double lat;
        private Double lng;
        /** WAITING at pickup stop, ON_BUS when trip is active. */
        private String trackingStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LivePositionDto {
        private double lat;
        private double lng;
        private Double heading;
        private Double speedKmh;
        private String recordedAt;
    }
}
