package com.classroom.backend.dto.request;

import com.classroom.backend.model.enums.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CalendarEventRequest {

    @NotBlank(message = "Label is required")
    private String label;

    @NotBlank(message = "Date is required")
    private String date;

    private String time;
    private String location;

    @NotNull(message = "Type is required")
    private EventType type;
}
