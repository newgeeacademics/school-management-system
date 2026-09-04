package com.classroom.backend.repository;

import com.classroom.backend.model.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, String> {
    List<PushSubscription> findByAppUserId(String appUserId);

    Optional<PushSubscription> findByEndpoint(String endpoint);

    void deleteByAppUserIdAndEndpoint(String appUserId, String endpoint);
}
