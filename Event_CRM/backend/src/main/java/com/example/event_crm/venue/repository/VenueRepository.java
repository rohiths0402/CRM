package com.example.event_crm.venue.repository;

import com.example.event_crm.venue.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VenueRepository extends JpaRepository<Venue, Long> {

    List<Venue> findAllByOrderByNameAsc();
}