package com.classroom.backend.repository;

import com.classroom.backend.model.PortalChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortalChatMessageRepository extends JpaRepository<PortalChatMessage, String> {

    List<PortalChatMessage> findTop100BySchoolKeyOrderBySentAtDesc(String schoolKey);
}
