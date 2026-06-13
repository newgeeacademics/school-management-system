package com.classroom.backend.dto.request;

import com.classroom.backend.model.enums.MessageAudience;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ParentMessageRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Body is required")
    private String body;

    private MessageAudience audience = MessageAudience.PARENTS;

    private String classId;

    private List<String> parentIds = new ArrayList<>();

    private boolean sendEmail = true;

    private boolean publishOnPortal = true;
}
