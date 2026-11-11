package com.example.event_crm.lineup.repository;

import com.example.event_crm.lineup.model.LineupSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LineupSlotRepository extends JpaRepository<LineupSlot, Long> {

    List<LineupSlot> findByEventId(Long eventId);
}