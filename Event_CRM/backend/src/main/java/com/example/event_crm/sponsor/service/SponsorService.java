package com.example.event_crm.sponsor.service;

import com.example.event_crm.event.model.Event;
import com.example.event_crm.event.repository.EventRepository;
import com.example.event_crm.event.service.EventTotalsService;
import com.example.event_crm.sponsor.dto.ContractFileInfo;
import com.example.event_crm.sponsor.dto.DeliverableRequest;
import com.example.event_crm.sponsor.dto.DeliverableResponse;
import com.example.event_crm.sponsor.dto.SponsorRequest;
import com.example.event_crm.sponsor.dto.SponsorResponse;
import com.example.event_crm.sponsor.model.Sponsor;
import com.example.event_crm.sponsor.model.SponsorDeliverable;
import com.example.event_crm.sponsor.repository.SponsorDeliverableRepository;
import com.example.event_crm.sponsor.repository.SponsorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
public class SponsorService {

    private static final long MAX_CONTRACT_BYTES = 3L * 1024 * 1024;

    private final SponsorRepository sponsorRepository;
    private final SponsorDeliverableRepository deliverableRepository;
    private final EventRepository eventRepository;
    private final EventTotalsService totalsService;

    public SponsorService(SponsorRepository sponsorRepository, SponsorDeliverableRepository deliverableRepository,
                          EventRepository eventRepository, EventTotalsService totalsService) {
        this.sponsorRepository = sponsorRepository;
        this.deliverableRepository = deliverableRepository;
        this.eventRepository = eventRepository;
        this.totalsService = totalsService;
    }

    public List<SponsorResponse> list() {
        List<Sponsor> sponsors = new ArrayList<>(sponsorRepository.findAll());
        sponsors.sort((a, b) -> Long.compare(b.getId(), a.getId()));

        List<SponsorResponse> result = new ArrayList<>();
        for (Sponsor sponsor : sponsors) {
            result.add(toResponse(sponsor));
        }
        return result;
    }

    @Transactional
    public SponsorResponse create(SponsorRequest request) {
        Event event = request.eventId() == null ? null : eventRepository.findById(request.eventId()).orElse(null);
        if (event == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid event");
        }
        if ("WRAP".equals(event.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This event is wrapped, so no new sponsors can be added");
        }
        checkSponsor(request, event, null);

        Sponsor sponsor = new Sponsor();
        sponsor.setEventId(event.getId());
        fill(sponsor, request);
        Sponsor saved = sponsorRepository.save(sponsor);

        if (Boolean.TRUE.equals(request.addStandardDeliverables())) {
            addStandardDeliverables(saved, event.getEventDate());
        }

        totalsService.refresh(event.getId());
        return toResponse(saved);
    }

    public SponsorResponse update(Long id, SponsorRequest request) {
        Sponsor sponsor = find(id);
        Event event = eventRepository.findById(sponsor.getEventId()).orElse(null);
        if (event == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
        }
        checkSponsor(request, event, id);

        fill(sponsor, request);
        return toResponse(sponsorRepository.save(sponsor));
    }

    @Transactional
    public void delete(Long id) {
        Sponsor sponsor = find(id);
        if (sponsor.getAmountReceived() > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Payment is already received from this sponsor, so it cannot be deleted");
        }
        deliverableRepository.deleteBySponsorId(id);
        sponsorRepository.delete(sponsor);
        totalsService.refresh(sponsor.getEventId());
    }

    public SponsorResponse addDeliverable(Long sponsorId, DeliverableRequest request) {
        Sponsor sponsor = find(sponsorId);
        LocalDate dueDate = checkDeliverable(request, sponsor);

        SponsorDeliverable deliverable = new SponsorDeliverable();
        deliverable.setSponsorId(sponsorId);
        deliverable.setText(request.text().trim());
        deliverable.setDueDate(dueDate);
        deliverable.setStatus("PENDING");
        deliverableRepository.save(deliverable);
        return toResponse(sponsor);
    }

    public SponsorResponse updateDeliverable(Long sponsorId, Long deliverableId, DeliverableRequest request) {
        Sponsor sponsor = find(sponsorId);
        SponsorDeliverable deliverable = findDeliverable(sponsorId, deliverableId);
        LocalDate dueDate = checkDeliverable(request, sponsor);

        deliverable.setText(request.text().trim());
        deliverable.setDueDate(dueDate);
        deliverableRepository.save(deliverable);
        return toResponse(sponsor);
    }

    public SponsorResponse updateDeliverableStatus(Long sponsorId, Long deliverableId, String status) {
        if (!"PENDING".equals(status) && !"IN_REVIEW".equals(status) && !"DONE".equals(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be PENDING, IN_REVIEW or DONE");
        }
        Sponsor sponsor = find(sponsorId);
        SponsorDeliverable deliverable = findDeliverable(sponsorId, deliverableId);
        deliverable.setStatus(status);
        deliverableRepository.save(deliverable);
        return toResponse(sponsor);
    }

    public SponsorResponse deleteDeliverable(Long sponsorId, Long deliverableId) {
        Sponsor sponsor = find(sponsorId);
        deliverableRepository.delete(findDeliverable(sponsorId, deliverableId));
        return toResponse(sponsor);
    }

    private void checkSponsor(SponsorRequest request, Event event, Long ignoreId) {
        if (request.brandName() == null || request.brandName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Brand name is required");
        }
        String tier = request.tier();
        if (!"TITLE".equals(tier) && !"POWERED_BY".equals(tier) && !"ASSOCIATE".equals(tier)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tier must be TITLE, POWERED_BY or ASSOCIATE");
        }
        if (request.contractValue() < 0 || request.amountReceived() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amounts cannot be negative");
        }
        if (request.amountReceived() > request.contractValue()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Amount received cannot be more than the contract value, Rs " + request.contractValue());
        }
        ContractFileInfo file = request.contractFile();
        if (file != null && file.size() != null && file.size() > MAX_CONTRACT_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Contract PDF must be 3 MB or smaller");
        }

        String brand = request.brandName().trim();
        int sameTier = 0;
        for (Sponsor other : sponsorRepository.findByEventId(event.getId())) {
            if (ignoreId != null && other.getId().equals(ignoreId)) {
                continue;
            }
            if (other.getBrandName().equalsIgnoreCase(brand)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        brand + " is already a sponsor of " + event.getTitle());
            }
            if (tier.equals(other.getTier())) {
                sameTier++;
            }
        }

        int limit = "TITLE".equals(tier) ? 1 : "POWERED_BY".equals(tier) ? 3 : -1;
        if (limit > 0 && sameTier >= limit) {
            String label = "TITLE".equals(tier) ? "Title Sponsor" : "Powered By partners";
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    event.getTitle() + " already has the maximum of " + limit + " " + label);
        }
    }

    private LocalDate checkDeliverable(DeliverableRequest request, Sponsor sponsor) {
        if (request.text() == null || request.text().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deliverable text is required");
        }
        LocalDate dueDate;
        try {
            dueDate = LocalDate.parse(request.dueDate());
        } catch (DateTimeParseException | NullPointerException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Due date must be in yyyy-MM-dd format");
        }
        Event event = eventRepository.findById(sponsor.getEventId()).orElse(null);
        if (event != null && event.getEventDate() != null && dueDate.isAfter(event.getEventDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The due date must be on or before the event date");
        }
        return dueDate;
    }

    private void addStandardDeliverables(Sponsor sponsor, LocalDate eventDate) {
        if (eventDate == null) {
            return;
        }
        List<String> texts = new ArrayList<>(List.of(
                "Logo on website and ticket pages",
                "Social media announcement",
                "Banner placement at venue"));

        if ("TITLE".equals(sponsor.getTier())) {
            texts.add("Brand name in event title");
            texts.add("Stage branding");
        } else if ("POWERED_BY".equals(sponsor.getTier())) {
            texts.add("Stage mention by the host");
        }

        for (int i = 0; i < texts.size(); i++) {
            SponsorDeliverable deliverable = new SponsorDeliverable();
            deliverable.setSponsorId(sponsor.getId());
            deliverable.setText(texts.get(i));
            deliverable.setDueDate(eventDate.minusDays((texts.size() - i) * 2L));
            deliverable.setStatus("PENDING");
            deliverableRepository.save(deliverable);
        }
    }

    private void fill(Sponsor sponsor, SponsorRequest request) {
        sponsor.setBrandName(request.brandName().trim());
        sponsor.setIndustry(request.industry());
        sponsor.setTier(request.tier());
        sponsor.setContractValue(request.contractValue());
        sponsor.setAmountReceived(request.amountReceived());
        sponsor.setContactName(request.contactName());
        sponsor.setContactEmail(request.contactEmail());
        sponsor.setContactPhone(request.contactPhone());

        ContractFileInfo file = request.contractFile();
        if (file == null || file.name() == null || file.name().isBlank()) {
            sponsor.setContractFileName(null);
            sponsor.setContractFileSize(null);
            sponsor.setContractFileUrl(null);
        } else {
            sponsor.setContractFileName(file.name());
            sponsor.setContractFileSize(file.size());
            sponsor.setContractFileUrl(file.url());
        }
    }

    private Sponsor find(Long id) {
        return sponsorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sponsor not found"));
    }

    private SponsorDeliverable findDeliverable(Long sponsorId, Long deliverableId) {
        SponsorDeliverable deliverable = deliverableRepository.findById(deliverableId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deliverable not found"));
        if (!deliverable.getSponsorId().equals(sponsorId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Deliverable not found");
        }
        return deliverable;
    }

    private String paymentStatus(Sponsor sponsor) {
        if (sponsor.getAmountReceived() <= 0) {
            return "PENDING";
        }
        return sponsor.getAmountReceived() >= sponsor.getContractValue() ? "PAID" : "PARTIAL";
    }

    private String text(String value) {
        return value == null ? "" : value;
    }

    private SponsorResponse toResponse(Sponsor sponsor) {
        Event event = eventRepository.findById(sponsor.getEventId()).orElse(null);

        List<DeliverableResponse> deliverables = new ArrayList<>();
        for (SponsorDeliverable item : deliverableRepository.findBySponsorIdOrderByDueDateAsc(sponsor.getId())) {
            deliverables.add(new DeliverableResponse(
                    item.getId(),
                    item.getText(),
                    item.getDueDate() == null ? "" : item.getDueDate().toString(),
                    item.getStatus()));
        }

        ContractFileInfo file = null;
        if (sponsor.getContractFileName() != null && !sponsor.getContractFileName().isBlank()) {
            file = new ContractFileInfo(sponsor.getContractFileName(), sponsor.getContractFileSize(),
                    sponsor.getContractFileUrl());
        }

        return new SponsorResponse(
                sponsor.getId(),
                sponsor.getEventId(),
                event == null ? "Deleted event" : event.getTitle(),
                event == null || event.getEventDate() == null ? "" : event.getEventDate().toString(),
                event == null || event.getStatus() == null ? "WRAP" : event.getStatus(),
                sponsor.getBrandName(),
                text(sponsor.getIndustry()),
                sponsor.getTier(),
                sponsor.getContractValue(),
                sponsor.getAmountReceived(),
                paymentStatus(sponsor),
                text(sponsor.getContactName()),
                text(sponsor.getContactEmail()),
                text(sponsor.getContactPhone()),
                file,
                deliverables);
    }
}