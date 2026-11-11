package com.example.event_crm.ticketing.service;

import com.example.event_crm.event.model.Event;
import com.example.event_crm.event.repository.EventRepository;
import com.example.event_crm.event.service.EventTotalsService;
import com.example.event_crm.ticketing.dto.TierRequest;
import com.example.event_crm.ticketing.dto.TierResponse;
import com.example.event_crm.ticketing.model.TicketTier;
import com.example.event_crm.ticketing.repository.TicketTierRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TierService {

    private static final String LIVE_MESSAGE = "The tier is sold out, or the event is not TICKETS_LIVE or ONGOING";

    private final TicketTierRepository tierRepository;
    private final EventRepository eventRepository;
    private final EventTotalsService totalsService;

    public TierService(TicketTierRepository tierRepository, EventRepository eventRepository,
                       EventTotalsService totalsService) {
        this.tierRepository = tierRepository;
        this.eventRepository = eventRepository;
        this.totalsService = totalsService;
    }

    public List<TierResponse> list() {
        Map<Long, Event> eventById = new HashMap<>();
        for (Event event : eventRepository.findAll()) {
            eventById.put(event.getId(), event);
        }

        List<TierResponse> result = new ArrayList<>();
        for (TicketTier tier : tierRepository.findAll()) {
            result.add(toResponse(tier, eventById.get(tier.getEventId())));
        }
        return result;
    }

    public TierResponse create(TierRequest request) {
        Event event = null;
        if (request.eventId() != null) {
            event = eventRepository.findById(request.eventId()).orElse(null);
        }
        if (event == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid event");
        }

        checkValues(request);

        if (tierRepository.existsByEventIdAndNameIgnoreCase(event.getId(), request.name().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The event already has a tier with this name");
        }
        checkSeats(event, request.quota(), null);

        TicketTier tier = new TicketTier();
        tier.setEventId(event.getId());
        fill(tier, request);
        tier.setStatus("PAUSED");
        TicketTier saved = tierRepository.save(tier);

        totalsService.refresh(event.getId());
        return toResponse(saved, event);
    }

    public TierResponse update(Long id, TierRequest request) {
        TicketTier tier = find(id);
        Event event = eventRepository.findById(tier.getEventId()).orElse(null);
        checkValues(request);

        if (request.quota() < tier.getSold() || (tier.getSold() > 0 && request.price() != tier.getPrice())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Quota is lower than tickets sold, or price changed after tickets were sold");
        }

        if (tierRepository.existsByEventIdAndNameIgnoreCaseAndIdNot(tier.getEventId(), request.name().trim(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The event already has a tier with this name");
        }
        if (event != null) {
            checkSeats(event, request.quota(), id);
        }

        fill(tier, request);
        if (tier.getSold() >= tier.getQuota()) {
            tier.setStatus("SOLD_OUT");
        } else if ("SOLD_OUT".equals(tier.getStatus())) {
            tier.setStatus("PAUSED");
        }
        TicketTier saved = tierRepository.save(tier);

        totalsService.refresh(tier.getEventId());
        return toResponse(saved, event);
    }

    public TierResponse updateStatus(Long id, String status) {
        if (!"ACTIVE".equals(status) && !"PAUSED".equals(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be ACTIVE or PAUSED");
        }

        TicketTier tier = find(id);
        Event event = eventRepository.findById(tier.getEventId()).orElse(null);

        if ("SOLD_OUT".equals(tier.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, LIVE_MESSAGE);
        }
        if ("ACTIVE".equals(status)) {
            String eventStatus = event == null ? "" : event.getStatus();
            if (!"TICKETS_LIVE".equals(eventStatus) && !"ONGOING".equals(eventStatus)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, LIVE_MESSAGE);
            }
        }

        tier.setStatus(status);
        return toResponse(tierRepository.save(tier), event);
    }

    public void delete(Long id) {
        TicketTier tier = find(id);
        if (tier.getSold() > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The tier has sold tickets");
        }
        tierRepository.delete(tier);
        totalsService.refresh(tier.getEventId());
    }

    private void checkValues(TierRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tier name is required");
        }
        if (request.price() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price cannot be negative");
        }
        if (request.taxPercentage() < 0 || request.taxPercentage() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "GST must be between 0 and 100");
        }
        if (request.quota() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quota must be at least 1");
        }
        if (request.maxPerOrder() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Max per order must be at least 1");
        }
    }

    private void checkSeats(Event event, int quota, Long ignoreId) {
        int others = 0;
        for (TicketTier other : tierRepository.findByEventId(event.getId())) {
            if (ignoreId == null || !other.getId().equals(ignoreId)) {
                others += other.getQuota();
            }
        }
        if (others + quota > event.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Quota is more than the seats left to release for the event");
        }
    }

    private void fill(TicketTier tier, TierRequest request) {
        tier.setName(request.name().trim());
        tier.setPerks(request.perks());
        tier.setPrice(request.price());
        tier.setTaxPercentage(request.taxPercentage());
        tier.setQuota(request.quota());
        tier.setMaxPerOrder(request.maxPerOrder());
    }

    private TicketTier find(Long id) {
        return tierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket tier not found"));
    }

    private TierResponse toResponse(TicketTier tier, Event event) {
        return new TierResponse(
                tier.getId(),
                tier.getEventId(),
                event == null ? "" : event.getTitle(),
                event == null || event.getStatus() == null ? "DRAFT" : event.getStatus(),
                tier.getName(),
                tier.getPerks() == null ? "" : tier.getPerks(),
                tier.getPrice(),
                tier.getTaxPercentage(),
                tier.getQuota(),
                tier.getSold(),
                tier.getMaxPerOrder(),
                tier.getStatus()
        );
    }
}