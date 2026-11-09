package com.example.event_crm.event.repository;

import com.example.event_crm.event.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByOrderByEventDateAsc();

    List<Event> findByStatusOrderByEventDateAsc(String status);
}