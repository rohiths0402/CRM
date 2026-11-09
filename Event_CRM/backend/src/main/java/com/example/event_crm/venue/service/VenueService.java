package com.example.event_crm.venue.service;

import com.example.event_crm.venue.dto.VenueRequest;
import com.example.event_crm.venue.dto.VenueResponse;
import com.example.event_crm.venue.dto.ZoneRequest;
import com.example.event_crm.venue.model.Venue;
import com.example.event_crm.venue.model.VenueZone;
import com.example.event_crm.venue.repository.VenueRepository;
import com.example.event_crm.venue.repository.VenueZoneRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class VenueService {

    private final VenueRepository venues;
    private final VenueZoneRepository zones;

    public VenueService(VenueRepository venues, VenueZoneRepository zones) {
        this.venues = venues;
        this.zones = zones;
    }

    public List<VenueResponse> list() {
        List<Venue> venueList = venues.findAllByOrderByNameAsc();
        List<Long> ids = venueList.stream().map(Venue::getId).toList();
        Map<Long, List<VenueZone>> byVenue = zones.findByVenueIdIn(ids).stream()
                .collect(Collectors.groupingBy(VenueZone::getVenueId));
        return venueList.stream()
                .map(v -> toResponse(v, byVenue.getOrDefault(v.getId(), List.of())))
                .toList();
    }

    public VenueResponse get(Long id) {
        Venue venue = find(id);
        return toResponse(venue, zones.findByVenueId(id));
    }

    public VenueResponse add(VenueRequest request) {
        Venue venue = new Venue();
        fill(venue, request);
        return toResponse(venues.save(venue), List.of());
    }

    public VenueResponse update(Long id, VenueRequest request) {
        Venue venue = find(id);
        fill(venue, request);
        venues.save(venue);
        return toResponse(venue, zones.findByVenueId(id));
    }

    @Transactional
    public void delete(Long id) {
        Venue venue = find(id);
        zones.deleteByVenueId(id);
        venues.delete(venue);
    }

    public VenueResponse addZone(Long venueId, ZoneRequest request) {
        Venue venue = find(venueId);
        checkCapacity(venue, request.capacity(), null);
        VenueZone zone = new VenueZone();
        zone.setVenueId(venueId);
        fillZone(zone, request);
        zones.save(zone);
        return toResponse(venue, zones.findByVenueId(venueId));
    }

    public VenueResponse updateZone(Long venueId, Long zoneId, ZoneRequest request) {
        Venue venue = find(venueId);
        VenueZone zone = findZone(venueId, zoneId);
        checkCapacity(venue, request.capacity(), zoneId);
        fillZone(zone, request);
        zones.save(zone);
        return toResponse(venue, zones.findByVenueId(venueId));
    }

    public VenueResponse deleteZone(Long venueId, Long zoneId) {
        Venue venue = find(venueId);
        zones.delete(findZone(venueId, zoneId));
        return toResponse(venue, zones.findByVenueId(venueId));
    }

    private Venue find(Long id) {
        return venues.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue not found."));
    }

    private VenueZone findZone(Long venueId, Long zoneId) {
        return zones.findById(zoneId)
                .filter(z -> z.getVenueId().equals(venueId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zone not found."));
    }

    private void checkCapacity(Venue venue, int newCapacity, Long ignoreZoneId) {
        int used = zones.findByVenueId(venue.getId()).stream()
                .filter(z -> !z.getId().equals(ignoreZoneId))
                .mapToInt(VenueZone::getCapacity)
                .sum();
        if (used + newCapacity > venue.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Zone capacity is more than the venue capacity of " + venue.getCapacity() + ".");
        }
    }

    private void fill(Venue venue, VenueRequest request) {
        venue.setName(request.name().trim());
        venue.setCity(request.city().trim());
        venue.setAddress(request.address());
        venue.setCapacity(request.capacity());
        venue.setParkingCapacity(request.parkingCapacity());
        venue.setBaseRentalCost(request.baseRentalCost());
    }

    private void fillZone(VenueZone zone, ZoneRequest request) {
        zone.setName(request.name().trim());
        zone.setCapacity(request.capacity());
        zone.setFireExitVerified(request.fireExitVerified());
    }

    private VenueResponse toResponse(Venue v, List<VenueZone> zoneList) {
        List<VenueResponse.Zone> items = zoneList.stream()
                .map(z -> new VenueResponse.Zone(z.getId(), z.getName(), z.getCapacity(),
                        z.getSoldCount(), z.isFireExitVerified()))
                .toList();
        return new VenueResponse(v.getId(), v.getName(), v.getCity(), v.getAddress(), v.getCapacity(),
                v.getParkingCapacity(), v.getBaseRentalCost(), items);
    }
}