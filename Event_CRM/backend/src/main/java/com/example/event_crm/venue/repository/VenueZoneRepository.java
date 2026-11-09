package com.example.event_crm.venue.repository;

import com.example.event_crm.venue.model.VenueZone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface VenueZoneRepository extends JpaRepository<VenueZone, Long> {

    List<VenueZone> findByVenueId(Long venueId);

    List<VenueZone> findByVenueIdIn(Collection<Long> venueIds);

    void deleteByVenueId(Long venueId);
}