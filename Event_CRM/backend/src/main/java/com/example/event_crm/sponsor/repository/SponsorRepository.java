package com.example.event_crm.sponsor.repository;

import com.example.event_crm.sponsor.model.Sponsor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SponsorRepository extends JpaRepository<Sponsor, Long> {

    List<Sponsor> findByEventId(Long eventId);

    long countByEventId(Long eventId);

    boolean existsByEventId(Long eventId);
}