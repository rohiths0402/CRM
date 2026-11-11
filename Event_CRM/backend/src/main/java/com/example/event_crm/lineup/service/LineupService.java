package com.example.event_crm.lineup.service;

import com.example.event_crm.event.model.Event;
import com.example.event_crm.event.repository.EventRepository;
import com.example.event_crm.lineup.dto.RiderItemRequest;
import com.example.event_crm.lineup.dto.RiderItemResponse;
import com.example.event_crm.lineup.dto.RiderRequest;
import com.example.event_crm.lineup.dto.SlotRequest;
import com.example.event_crm.lineup.dto.SlotResponse;
import com.example.event_crm.lineup.model.LineupSlot;
import com.example.event_crm.lineup.model.RiderItem;
import com.example.event_crm.lineup.repository.LineupSlotRepository;
import com.example.event_crm.lineup.repository.RiderItemRepository;
import com.example.event_crm.venue.model.Venue;
import com.example.event_crm.venue.repository.VenueRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class LineupService {

    private static final List<String> ROLES = List.of("Headliner", "Support act", "Opening act", "DJ set",
            "Dance troupe", "Stand-up comedian", "Anchor / MC", "Guest appearance");
    private static final List<String> STATUSES = List.of("TENTATIVE", "CONFIRMED", "CANCELLED");
    private static final List<String> RIDER_STATUSES = List.of("PENDING", "CONFIRMED", "READY");
    private static final List<String> CATEGORIES = List.of("DIETARY", "SOUND", "SECURITY", "HOSPITALITY", "TRAVEL");

    private static final String[][] STANDARD_RIDER = {
            {"Dietary requirements arranged", "DIETARY"},
            {"Sound rig and backline confirmed", "SOUND"},
            {"Security escort assigned", "SECURITY"},
            {"Green room stocked and ready", "HOSPITALITY"},
            {"Travel and local transport arranged", "TRAVEL"},
            {"Accommodation booked", "TRAVEL"}
    };

    private final LineupSlotRepository slotRepository;
    private final RiderItemRepository itemRepository;
    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final LineupRules rules;

    public LineupService(LineupSlotRepository slotRepository, RiderItemRepository itemRepository,
                         EventRepository eventRepository, VenueRepository venueRepository, LineupRules rules) {
        this.slotRepository = slotRepository;
        this.itemRepository = itemRepository;
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.rules = rules;
    }

    public List<SlotResponse> list(Long eventId) {
        List<LineupSlot> slots = eventId == null ? slotRepository.findAll() : slotRepository.findByEventId(eventId);
        List<LineupSlot> sorted = new ArrayList<>(slots);
        sorted.sort((a, b) -> Long.compare(a.getId(), b.getId()));

        List<SlotResponse> result = new ArrayList<>();
        for (LineupSlot slot : sorted) {
            result.add(toResponse(slot));
        }
        return result;
    }

    @Transactional
    public SlotResponse create(SlotRequest request) {
        Event event = request.eventId() == null ? null : eventRepository.findById(request.eventId()).orElse(null);
        if (event == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid event");
        }
        assertEditable(event);

        LineupSlot slot = new LineupSlot();
        slot.setEventId(event.getId());
        slot.setManagerEmail("");
        slot.setDietaryNotes("");
        slot.setSoundRigNotes("");
        slot.setSecurityNotes("");
        fill(slot, request);
        check(slot, event, null);

        LineupSlot saved = slotRepository.save(slot);

        if (Boolean.TRUE.equals(request.addStandardRider())) {
            for (String[] template : STANDARD_RIDER) {
                RiderItem item = new RiderItem();
                item.setSlotId(saved.getId());
                item.setLabel(template[0]);
                item.setCategory(template[1]);
                item.setStatus("PENDING");
                itemRepository.save(item);
            }
        }
        return toResponse(saved);
    }

    @Transactional
    public SlotResponse update(Long id, SlotRequest request) {
        LineupSlot slot = find(id);
        Event event = findEvent(slot.getEventId());
        assertEditable(event);

        fill(slot, request);
        check(slot, event, id);
        return toResponse(slotRepository.save(slot));
    }

    @Transactional
    public void delete(Long id) {
        LineupSlot slot = find(id);
        assertEditable(findEvent(slot.getEventId()));
        if (slot.getAdvancePaid() > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "An advance is already paid to this artist. Mark the slot as cancelled instead of deleting it.");
        }
        itemRepository.deleteBySlotId(id);
        slotRepository.delete(slot);
    }

    @Transactional
    public SlotResponse updateRider(Long id, RiderRequest request) {
        LineupSlot slot = find(id);
        assertEditable(findEvent(slot.getEventId()));

        String name = clean(request.managerName());
        String phone = clean(request.managerPhone());
        checkManager(slot.getStatus(), name, phone);

        slot.setManagerName(name);
        slot.setManagerPhone(phone);
        slot.setManagerEmail(clean(request.managerEmail()));
        slot.setDietaryNotes(clean(request.dietaryNotes()));
        slot.setSoundRigNotes(clean(request.soundRigNotes()));
        slot.setSecurityNotes(clean(request.securityNotes()));
        slot.setEscortRequired(Boolean.TRUE.equals(request.escortRequired()));
        return toResponse(slotRepository.save(slot));
    }

    @Transactional
    public SlotResponse addRiderItem(Long id, RiderItemRequest request) {
        LineupSlot slot = find(id);
        assertEditable(findEvent(slot.getEventId()));

        String label = clean(request.label());
        if (label.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item label is required");
        }
        if (!CATEGORIES.contains(request.category())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Category must be DIETARY, SOUND, SECURITY, HOSPITALITY or TRAVEL");
        }
        for (RiderItem existing : itemRepository.findBySlotIdOrderByIdAsc(id)) {
            if (existing.getLabel().equalsIgnoreCase(label)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "This item is already on the rider list");
            }
        }

        RiderItem item = new RiderItem();
        item.setSlotId(id);
        item.setLabel(label);
        item.setCategory(request.category());
        item.setStatus("PENDING");
        itemRepository.save(item);
        return toResponse(slot);
    }

    @Transactional
    public SlotResponse updateRiderItemStatus(Long id, Long itemId, String status) {
        if (!RIDER_STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be PENDING, CONFIRMED or READY");
        }
        LineupSlot slot = find(id);
        assertEditable(findEvent(slot.getEventId()));

        RiderItem item = findItem(id, itemId);
        item.setStatus(status);
        itemRepository.save(item);
        return toResponse(slot);
    }

    @Transactional
    public SlotResponse removeRiderItem(Long id, Long itemId) {
        LineupSlot slot = find(id);
        assertEditable(findEvent(slot.getEventId()));

        itemRepository.delete(findItem(id, itemId));
        return toResponse(slot);
    }

    private void fill(LineupSlot slot, SlotRequest request) {
        if (request.artistName() == null || request.artistName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Artist name is required");
        }
        if (request.stage() == null || request.stage().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stage is required");
        }
        if (!ROLES.contains(request.role())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid role");
        }
        if (!STATUSES.contains(request.status())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be TENTATIVE, CONFIRMED or CANCELLED");
        }
        checkTime(request.start(), "Start time");
        checkTime(request.end(), "End time");

        String soundcheck = request.soundcheck() == null ? "" : request.soundcheck().trim();
        if (!soundcheck.isEmpty()) {
            checkTime(soundcheck, "Soundcheck");
        }
        if (request.fee() < 0 || request.advancePaid() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fee and advance cannot be negative");
        }

        slot.setArtistName(request.artistName().trim());
        slot.setRole(request.role());
        slot.setStage(request.stage().trim());
        slot.setStartTime(request.start().trim());
        slot.setEndTime(request.end().trim());
        slot.setSoundcheck(soundcheck.isEmpty() ? null : soundcheck);
        slot.setGreenRoom(request.greenRoom());
        slot.setStatus(request.status());
        slot.setFee(request.fee());
        slot.setAdvancePaid(request.advancePaid());
        slot.setManagerName(clean(request.managerName()));
        slot.setManagerPhone(clean(request.managerPhone()));
    }

    private void check(LineupSlot slot, Event event, Long ignoreId) {
        if (event.getGatesOpen() == null || event.getCurfewTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Set the gates open and curfew time on the event first");
        }

        List<LineupSlot> others = new ArrayList<>();
        for (LineupSlot other : slotRepository.findByEventId(event.getId())) {
            boolean isSelf = ignoreId != null && other.getId().equals(ignoreId);
            if (!isSelf && !"CANCELLED".equals(other.getStatus())) {
                others.add(other);
            }
        }

        Venue venue = event.getVenueId() == null ? null : venueRepository.findById(event.getVenueId()).orElse(null);

        String problem = rules.firstProblem(slot, event, venue, others);
        if (problem != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, problem);
        }
        if (slot.getAdvancePaid() > slot.getFee()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The advance cannot be more than the fee");
        }
        checkManager(slot.getStatus(), slot.getManagerName(), slot.getManagerPhone());
    }

    private void checkManager(String status, String name, String phone) {
        boolean hasName = name != null && name.trim().length() >= 2;
        boolean hasPhone = phone != null && phone.trim().matches("[6-9]\\d{9}");

        if ("CONFIRMED".equals(status) && !(hasName && hasPhone)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A confirmed artist needs a manager name and a 10 digit mobile number");
        }
        if (phone != null && !phone.isBlank() && !hasPhone) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Enter a 10 digit mobile number for the manager");
        }
    }

    private void checkTime(String value, String label) {
        if (value == null || !value.trim().matches("([01]\\d|2[0-3]):[0-5]\\d")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " must be in HH:mm 24 hour format");
        }
    }

    private void assertEditable(Event event) {
        if ("WRAP".equals(event.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This event is wrapped, so its lineup is locked");
        }
    }

    private Event findEvent(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
    }

    private LineupSlot find(Long id) {
        return slotRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lineup slot not found"));
    }

    private RiderItem findItem(Long slotId, Long itemId) {
        RiderItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rider item not found"));
        if (!item.getSlotId().equals(slotId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rider item not found");
        }
        return item;
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private String text(String value) {
        return value == null ? "" : value;
    }

    private SlotResponse toResponse(LineupSlot slot) {
        List<RiderItemResponse> items = new ArrayList<>();
        for (RiderItem item : itemRepository.findBySlotIdOrderByIdAsc(slot.getId())) {
            items.add(new RiderItemResponse(item.getId(), item.getLabel(), item.getCategory(), item.getStatus()));
        }

        return new SlotResponse(
                slot.getId(),
                slot.getEventId(),
                slot.getArtistName(),
                text(slot.getRole()),
                text(slot.getStage()),
                text(slot.getStartTime()),
                text(slot.getEndTime()),
                text(slot.getSoundcheck()),
                slot.getGreenRoom(),
                slot.getStatus(),
                slot.getFee(),
                slot.getAdvancePaid(),
                text(slot.getManagerName()),
                text(slot.getManagerPhone()),
                text(slot.getManagerEmail()),
                text(slot.getDietaryNotes()),
                text(slot.getSoundRigNotes()),
                text(slot.getSecurityNotes()),
                slot.isEscortRequired(),
                items);
    }
}