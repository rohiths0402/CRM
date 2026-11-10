package com.example.event_crm.event.repository;

import com.example.event_crm.event.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    boolean existsByVenueIdAndEventDate(Long venueId, LocalDate eventDate);

    boolean existsByVenueIdAndEventDateAndIdNot(Long venueId, LocalDate eventDate, Long id);

    long countByVenueId(Long venueId);

    List<Event> findByVenueId(Long venueId);
}