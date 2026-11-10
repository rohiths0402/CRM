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
            result.add(toShape(event, venueById.get(event.getVenueId())));
        }
        return result;
    }

    public List<EventLocation> withCoordinates() {
        List<EventLocation> result = new ArrayList<>();
        for (EventLocation event : all()) {
            if (event.lat() != 0 || event.lng() != 0) {
                result.add(event);
            }
        }
        return result;
    }

    public EventLocation toShape(Event event, Venue venue) {
        double lat = 0;
        double lng = 0;
        if (venue != null && venue.getLatitude() != null && venue.getLongitude() != null) {
            lat = venue.getLatitude();
            lng = venue.getLongitude();
        }

        return new EventLocation(
                event.getId(),
                empty(event.getTitle()),
                empty(event.getCategory()),
                empty(event.getAgeRating()),
                statusCode(event.getStatus()),
                empty(event.getHeadliner()),
                empty(event.getDescription()),
                event.getVenueId(),
                venue == null ? "" : empty(venue.getName()),
                venue == null ? "" : empty(venue.getCity()),
                venue == null ? "" : empty(venue.getStateSlug()),
                lat,
                lng,
                event.getEventDate() == null ? "" : event.getEventDate().toString(),
                TimeText.format(event.getGatesOpen()),
                TimeText.format(event.getShowStart()),
                TimeText.format(event.getCurfewTime()),
                event.getCapacity(),
                event.getTicketsSold(),
                event.getGrossRevenue(),
                event.getSponsorCount(),
                event.getTargetBudget(),
                event.getProjectedRevenue(),
                empty(event.getBannerUrl())
        );
    }

    private String statusCode(String status) {
        if (status == null) {
            return "DRAFT";
        }
        return status.trim().toUpperCase().replace(' ', '_');
    }

    private String empty(String value) {
        return value == null ? "" : value;
    }
}