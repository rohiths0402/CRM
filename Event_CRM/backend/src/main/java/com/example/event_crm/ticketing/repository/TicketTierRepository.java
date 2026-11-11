package com.example.event_crm.ticketing.repository;

import com.example.event_crm.ticketing.model.TicketTier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketTierRepository extends JpaRepository<TicketTier, Long> {

    List<TicketTier> findByEventId(Long eventId);

    boolean existsByEventIdAndNameIgnoreCase(Long eventId, String name);

    boolean existsByEventIdAndNameIgnoreCaseAndIdNot(Long eventId, String name, Long id);
}