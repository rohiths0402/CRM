package com.example.event_crm.event.service;

import com.example.event_crm.event.dto.EventRequest;
import com.example.event_crm.event.dto.EventResponse;
import com.example.event_crm.event.model.Event;
import com.example.event_crm.event.repository.EventRepository;
import com.example.event_crm.venue.model.Venue;
import com.example.event_crm.venue.repository.VenueRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository events;
    private final VenueRepository venues;

    public EventService(EventRepository events, VenueRepository venues) {
        this.events = events;
        this.venues = venues;
    }

    public List<EventResponse> list(String status) {
        List<Event> list = status == null || status.isBlank()
                ? events.findAllByOrderByEventDateAsc()
                : events.findByStatusOrderByEventDateAsc(status);
        List<Long> venueIds = list.stream().map(Event::getVenueId).distinct().toList();
        Map<Long, Venue> venueMap = venues.findAllById(venueIds).stream()
                .collect(Collectors.toMap(Venue::getId, Function.identity()));
        return list.stream().map(e -> toResponse(e, venueMap.get(e.getVenueId()))).toList();
    }

    public EventResponse get(Long id) {
        Event event = find(id);
        return toResponse(event, venues.findById(event.getVenueId()).orElse(null));
    }

    public EventResponse add(EventRequest request) {
        Event event = new Event();
        event.setStatus("Draft");
        fill(event, request);
        return get(events.save(event).getId());
    }

    public EventResponse update(Long id, EventRequest request) {
        Event event = find(id);
        fill(event, request);
        events.save(event);
        return get(id);
    }

    public EventResponse changeStatus(Long id, String status) {
        Event event = find(id);
        event.setStatus(status);
        events.save(event);
        return get(id);
    }

    public void delete(Long id) {
        events.delete(find(id));
    }

    private Event find(Long id) {
        return events.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));
    }

    private void fill(Event event, EventRequest request) {
        if (!venues.existsById(request.venueId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "That venue does not exist.");
        }
        event.setTitle(request.title().trim());
        event.setCategory(request.category());
        event.setAgeRating(request.ageRating() == null || request.ageRating().isBlank() ? "All" : request.ageRating());
        if (request.status() != null && !request.status().isBlank()) {
            event.setStatus(request.status());
        }
        event.setVenueId(request.venueId());
        event.setEventDate(request.eventDate());
        event.setGatesOpen(request.gatesOpen());
        event.setShowStart(request.showStart());
        event.setCurfewTime(request.curfewTime());
        if (request.bannerUrl() != null && !request.bannerUrl().isBlank()) {
            event.setBannerUrl(request.bannerUrl().trim());
        }
        event.setTargetBudget(request.targetBudget());
        event.setProjectedRevenue(request.projectedRevenue());
    }

    private EventResponse toResponse(Event e, Venue v) {
        return new EventResponse(e.getId(), e.getTitle(), e.getCategory(), e.getAgeRating(), e.getStatus(),
                e.getVenueId(),
                v == null ? null : v.getName(),
                v == null ? null : v.getCity(),
                v == null ? 0 : v.getCapacity(),
                e.getEventDate() == null ? null : e.getEventDate().toString(),
                e.getGatesOpen() == null ? null : e.getGatesOpen().toString(),
                e.getShowStart() == null ? null : e.getShowStart().toString(),
                e.getCurfewTime() == null ? null : e.getCurfewTime().toString(),
                e.getBannerUrl(), e.getTargetBudget(), e.getProjectedRevenue());
    }
}