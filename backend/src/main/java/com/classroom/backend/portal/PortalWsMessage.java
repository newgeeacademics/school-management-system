package com.classroom.backend.portal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortalWsMessage {
    private String type;
    private String section;
    private String message;
    private String routeId;
    private Double lat;
    private Double lng;
    private String recordedAt;
}
