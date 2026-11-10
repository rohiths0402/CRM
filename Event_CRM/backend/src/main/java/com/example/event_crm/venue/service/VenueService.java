package com.example.event_crm.venue.service;

import com.example.event_crm.event.model.Event;
import com.example.event_crm.event.repository.EventRepository;
import com.example.event_crm.venue.dto.VenueRequest;
import com.example.event_crm.venue.dto.VenueResponse;
import com.example.event_crm.venue.dto.ZoneRequest;
import com.example.event_crm.venue.dto.ZoneResponse;
import com.example.event_crm.venue.model.Venue;
import com.example.event_crm.venue.model.VenueZone;
import com.example.event_crm.venue.repository.VenueRepository;
import com.example.event_crm.venue.repository.VenueZoneRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
public class VenueService {

    private static final List<String> KINDS = List.of("Lounge", "Seated", "Standing");
    private static final List<String> SAFETY = List.of("VERIFIED", "PENDING", "ACTION_REQUIRED");

    private final VenueRepository venueRepository;
    private final VenueZoneRepository zoneRepository;
    private final EventRepository eventRepository;

    public VenueService(VenueRepository venueRepository, VenueZoneRepository zoneRepository,
                        EventRepository eventRepository) {
        this.venueRepository = venueRepository;
        this.zoneRepository = zoneRepository;
        this.eventRepository = eventRepository;
    }

    public List<VenueResponse> list() {
        List<VenueResponse> result = new ArrayList<>();
        for (Venue venue : venueRepository.findAll()) {
            result.add(toResponse(venue));
        }
        return result;
    }

    public VenueResponse create(VenueRequest request) {
        Venue venue = new Venue();
        fill(venue, request);
        return toResponse(venueRepository.save(venue));
    }

    public VenueResponse update(Long id, VenueRequest request) {
        Venue venue = find(id);

        if (request.capacity() < zoneTotal(id) || eventNeedsMore(id, request.capacity())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Capacity is lower than an event booked here or lower than the seats already allocated to zones");
        }

        fill(venue, request);
        return toResponse(venueRepository.save(venue));
    }

    @Transactional
    public void delete(Long id) {
        Venue venue = find(id);
        if (eventRepository.countByVenueId(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Venue has events booked");
        }
        zoneRepository.deleteByVenueId(id);
        venueRepository.delete(venue);
    }

    public VenueResponse addZone(Long venueId, ZoneRequest request) {
        Venue venue = find(venueId);
        checkZone(request);

        if (zoneTotal(venueId) + request.capacity() > venue.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Total zone capacity is more than the venue licensed capacity");
        }

        VenueZone zone = new VenueZone();
        zone.setVenueId(venueId);
        fillZone(zone, request);
        zoneRepository.save(zone);
        return toResponse(venue);
    }

    public VenueResponse updateZone(Long venueId, Long zoneId, ZoneRequest request) {
        Venue venue = find(venueId);
        VenueZone zone = findZone(venueId, zoneId);
        checkZone(request);

        int others = zoneTotal(venueId) - zone.getCapacity();
        if (request.capacity() < zone.getSoldCount() || others + request.capacity() > venue.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Capacity is lower than tickets already sold, or total is more than the licensed capacity");
        }

        fillZone(zone, request);
        zoneRepository.save(zone);
        return toResponse(venue);
    }

    public VenueResponse removeZone(Long venueId, Long zoneId) {
        Venue venue = find(venueId);
        VenueZone zone = findZone(venueId, zoneId);

        if (zone.getSoldCount() > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Zone has tickets sold");
        }

        zoneRepository.delete(zone);
        return toResponse(venue);
    }

    private void fill(Venue venue, VenueRequest request) {
        String phone = request.contactPhone();
        if (phone != null && !phone.isBlank() && !phone.matches("\\d{10}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Contact phone must be 10 digits");
        }

        venue.setName(request.name());
        venue.setType(request.type());
        venue.setCity(request.city());
        venue.setStateSlug(request.stateSlug());
        venue.setAddress(request.address());
        venue.setLatitude(request.lat());
        venue.setLongitude(request.lng());
        venue.setCapacity(request.capacity());
        venue.setParkingCapacity(request.parkingStalls());
        venue.setBaseRentalCost(request.baseRent());
        venue.setGreenRooms(request.greenRooms());
        venue.setPowerBackup(request.powerBackup());
        venue.setWheelchairAccess(request.wheelchairAccess());
        venue.setFireNocValidTill(parseDate(request.fireNocValidTill()));
        venue.setContactName(request.contactName());
        venue.setContactPhone(phone);
    }

    private void checkZone(ZoneRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Zone name is required");
        }
        if (request.capacity() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Zone capacity must be at least 1");
        }
        if (request.fireExits() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fire exits cannot be negative");
        }
        if (!KINDS.contains(request.kind())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Zone kind must be Lounge, Seated or Standing");
        }
        String safety = request.safetyStatus();
        if (safety != null && !safety.isBlank() && !SAFETY.contains(safety)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Safety status must be VERIFIED, PENDING or ACTION_REQUIRED");
        }
    }

    private void fillZone(VenueZone zone, ZoneRequest request) {
        String safety = request.safetyStatus();
        zone.setName(request.name());
        zone.setKind(request.kind());
        zone.setCapacity(request.capacity());
        zone.setFireExits(request.fireExits());
        zone.setSafetyStatus(safety == null || safety.isBlank() ? "PENDING" : safety);
        zone.setLastInspection(parseDate(request.lastInspection()));
    }

    private int zoneTotal(Long venueId) {
        int total = 0;
        for (VenueZone zone : zoneRepository.findByVenueId(venueId)) {
            total += zone.getCapacity();
        }
        return total;
    }

    private boolean eventNeedsMore(Long venueId, int newCapacity) {
        for (Event event : eventRepository.findByVenueId(venueId)) {
            if (event.getCapacity() > newCapacity) {
                return true;
            }
        }
        return false;
    }

    private Venue find(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue not found"));
    }

    private VenueZone findZone(Long venueId, Long zoneId) {
        VenueZone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zone not found"));
        if (!zone.getVenueId().equals(venueId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Zone not found");
        }
        return zone;
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date must be in yyyy-MM-dd format");
        }
    }

    private VenueResponse toResponse(Venue venue) {
        List<ZoneResponse> zones = new ArrayList<>();
        for (VenueZone zone : zoneRepository.findByVenueId(venue.getId())) {
            zones.add(new ZoneResponse(
                    zone.getId(),
                    empty(zone.getName()),
                    empty(zone.getKind()),
                    zone.getCapacity(),
                    zone.getSoldCount(),
                    zone.getFireExits(),
                    empty(zone.getSafetyStatus()),
                    zone.getLastInspection() == null ? "" : zone.getLastInspection().toString()
            ));
        }

        return new VenueResponse(
                venue.getId(),
                empty(venue.getName()),
                empty(venue.getType()),
                empty(venue.getCity()),
                empty(venue.getStateSlug()),
                empty(venue.getAddress()),
                venue.getLatitude(),
                venue.getLongitude(),
                venue.getCapacity(),
                venue.getParkingCapacity(),
                venue.getBaseRentalCost(),
                venue.getGreenRooms(),
                venue.isPowerBackup(),
                venue.isWheelchairAccess(),
                venue.getFireNocValidTill() == null ? "" : venue.getFireNocValidTill().toString(),
                empty(venue.getContactName()),
                empty(venue.getContactPhone()),
                eventRepository.countByVenueId(venue.getId()),
                zones
        );
    }

    private String empty(String value) {
        return value == null ? "" : value;
    }
}