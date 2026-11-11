package com.example.event_crm.event.service;

import com.example.event_crm.event.dto.EventLocation;
import com.example.event_crm.event.dto.EventRequest;
import com.example.event_crm.event.model.Event;
import com.example.event_crm.event.repository.EventRepository;
import com.example.event_crm.sponsor.repository.SponsorRepository;
import com.example.event_crm.venue.model.Venue;
import com.example.event_crm.venue.repository.VenueRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class EventService {

    private static final List<String> STATUSES =
            List.of("DRAFT", "ANNOUNCED", "TICKETS_LIVE", "SOLD_OUT", "ONGOING", "WRAP");

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final EventLocationService eventLocationService;
    private final SponsorRepository sponsorRepository;

    public EventService(EventRepository eventRepository, VenueRepository venueRepository,
                        EventLocationService eventLocationService, SponsorRepository sponsorRepository) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.eventLocationService = eventLocationService;
        this.sponsorRepository = sponsorRepository;
    }

    public List<EventLocation> list() {
        return eventLocationService.all();
    }

    public EventLocation create(EventRequest request) {
        Event event = new Event();
        event.setStatus("DRAFT");
        Venue venue = fill(event, request, null);
        return eventLocationService.toShape(eventRepository.save(event), venue);
    }

    public EventLocation update(Long id, EventRequest request) {
        Event event = find(id);
        Venue venue = fill(event, request, id);
        return eventLocationService.toShape(eventRepository.save(event), venue);
    }

    public EventLocation updateStatus(Long id, String status) {
        if (status == null || !STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Status must be one of: DRAFT, ANNOUNCED, TICKETS_LIVE, SOLD_OUT, ONGOING, WRAP");
        }
        Event event = find(id);
        event.setStatus(status);
        Event saved = eventRepository.save(event);
        Venue venue = venueRepository.findById(saved.getVenueId()).orElse(null);
        return eventLocationService.toShape(saved, venue);
    }

    public void delete(Long id) {
        Event event = find(id);
        if (event.getTicketsSold() > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Event has sold tickets, move it to WRAP instead of deleting");
        }
        if (sponsorRepository.existsByEventId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This event has sponsor contracts. Remove them in Sponsors & Partners first.");
        }
        eventRepository.delete(event);
    }

    private Venue fill(Event event, EventRequest request, Long ignoreId) {
        Venue venue = null;
        if (request.venueId() != null) {
            venue = venueRepository.findById(request.venueId()).orElse(null);
        }
        if (venue == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid venue");
        }

        LocalDate date = parseDate(request.date());

        if (request.capacity() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacity must be at least 1");
        }
        if (request.capacity() > venue.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Capacity is more than the venue licensed capacity");
        }

        boolean booked;
        if (ignoreId == null) {
            booked = eventRepository.existsByVenueIdAndEventDate(venue.getId(), date);
        } else {
            booked = eventRepository.existsByVenueIdAndEventDateAndIdNot(venue.getId(), date, ignoreId);
        }
        if (booked) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Venue is already booked on this date");
        }

        event.setTitle(request.title());
        event.setCategory(request.category());
        event.setAgeRating(request.ageRating());
        event.setHeadliner(request.headliner());
        event.setDescription(request.description());
        event.setBannerUrl(request.bannerUrl());
        event.setVenueId(venue.getId());
        event.setEventDate(date);
        event.setGatesOpen(TimeText.parse(request.gatesOpen()));
        event.setShowStart(TimeText.parse(request.showStart()));
        event.setCurfewTime(TimeText.parse(request.curfew()));
        event.setCapacity(request.capacity());
        event.setTargetBudget(request.budget());
        event.setProjectedRevenue(request.projectedRevenue());
        return venue;
    }

    private Event find(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event date is required");
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date must be in yyyy-MM-dd format");
        }
    }
}