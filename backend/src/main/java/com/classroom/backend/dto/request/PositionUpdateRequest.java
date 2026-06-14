package com.classroom.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PositionUpdateRequest {

    @NotNull
    private Double lat;

    @NotNull
    private Double lng;

    private Double heading;
    private Double speedKmh;
}
