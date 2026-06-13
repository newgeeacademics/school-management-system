package com.classroom.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AnnouncementRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Body is required")
    private String body;

    private String eventDate;

    private String location;

    private boolean published = true;

    /** When true and published, send the announcement by e-mail to all families with an address on file. */
    private boolean notifyByEmail = false;
}
