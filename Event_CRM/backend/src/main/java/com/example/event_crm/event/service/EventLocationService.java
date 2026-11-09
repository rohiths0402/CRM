package com.example.event_crm.event.service;

import com.example.event_crm.event.dto.EventLocation;
import com.example.event_crm.event.model.Event;
import com.example.event_crm.event.repository.EventRepository;
import com.example.event_crm.venue.model.Venue;
import com.example.event_crm.venue.repository.VenueRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EventLocationService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;

    public EventLocationService(EventRepository eventRepository, VenueRepository venueRepository) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
    }

    public List<EventLocation> all() {
        Map<Long, Venue> venueById = new HashMap<>();
        for (Venue venue : venueRepository.findAll()) {
            venueById.put(venue.getId(), venue);
        }

        List<EventLocation> result = new ArrayList<>();
        for (Event event : eventRepository.findAll()) {
            Venue venue = venueById.get(event.getVenueId());
            if (venue == null || venue.getLatitude() == null || venue.getLongitude() == null) {
                continue;
            }

            result.add(new EventLocation(
                    event.getId(),
                    event.getTitle(),
                    event.getCategory(),
                    statusCode(event.getStatus()),
                    slug(venue.getState()),
                    venue.getCity(),
                    venue.getName(),
                    venue.getLatitude(),
                    venue.getLongitude(),
                    event.getEventDate() == null ? null : event.getEventDate().toString(),
                    event.getGatesOpen() == null ? null : event.getGatesOpen().toString(),
                    event.getShowStart() == null ? null : event.getShowStart().toString(),
                    venue.getCapacity(),
                    event.getTicketsSold(),
                    event.getGrossRevenue(),
                    event.getSponsorCount(),
                    event.getHeadliner()
            ));
        }
        return result;
    }

    private String statusCode(String status) {
        if (status == null) {
            return "DRAFT";
        }
        return status.trim().toUpperCase().replace(' ', '_');
    }

    private String slug(String state) {
        if (state == null) {
            return "";
        }
        return state.trim().toLowerCase().replace(' ', '-');
    }
}