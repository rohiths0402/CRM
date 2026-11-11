package com.example.event_crm.event.service;

import com.example.event_crm.event.model.Event;
import com.example.event_crm.event.repository.EventRepository;
import com.example.event_crm.sponsor.repository.SponsorRepository;
import com.example.event_crm.ticketing.model.TicketTier;
import com.example.event_crm.ticketing.repository.TicketTierRepository;
import org.springframework.stereotype.Service;

@Service
public class EventTotalsService {

    private final EventRepository eventRepository;
    private final TicketTierRepository tierRepository;
    private final SponsorRepository sponsorRepository;

    public EventTotalsService(EventRepository eventRepository, TicketTierRepository tierRepository,
                              SponsorRepository sponsorRepository) {
        this.eventRepository = eventRepository;
        this.tierRepository = tierRepository;
        this.sponsorRepository = sponsorRepository;
    }

    public void refresh(Long eventId) {
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event == null) {
            return;
        }

        long sold = 0;
        long revenue = 0;
        for (TicketTier tier : tierRepository.findByEventId(eventId)) {
            sold += tier.getSold();
            revenue += (long) tier.getSold() * tier.getPrice();
        }

        event.setTicketsSold(sold);
        event.setGrossRevenue(revenue);
        event.setSponsorCount((int) sponsorRepository.countByEventId(eventId));
        eventRepository.save(event);
    }
}