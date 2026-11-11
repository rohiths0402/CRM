package com.example.event_crm.lineup.repository;

import com.example.event_crm.lineup.model.RiderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RiderItemRepository extends JpaRepository<RiderItem, Long> {

    List<RiderItem> findBySlotIdOrderByIdAsc(Long slotId);

    void deleteBySlotId(Long slotId);
}