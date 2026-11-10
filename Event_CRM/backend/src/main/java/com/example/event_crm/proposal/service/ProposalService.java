package com.example.event_crm.proposal.service;

import com.example.event_crm.event.model.Event;
import com.example.event_crm.event.repository.EventRepository;
import com.example.event_crm.proposal.dto.ProposalRequest;
import com.example.event_crm.proposal.dto.ProposalResponse;
import com.example.event_crm.proposal.model.Proposal;
import com.example.event_crm.proposal.repository.ProposalRepository;
import com.example.event_crm.venue.repository.VenueRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProposalService {

    private static final List<String> STATUSES = List.of("Pending", "Under Review", "Accepted", "Rejected");

    private final ProposalRepository proposalRepository;
    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;

    public ProposalService(ProposalRepository proposalRepository, EventRepository eventRepository,
                           VenueRepository venueRepository) {
        this.proposalRepository = proposalRepository;
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
    }

    public List<ProposalResponse> list(String status) {
        List<Proposal> proposals;
        if (status == null || status.isBlank()) {
            proposals = proposalRepository.findAllByOrderByCreatedAtDesc();
        } else {
            proposals = proposalRepository.findByStatusOrderByCreatedAtDesc(status);
        }

        List<ProposalResponse> result = new ArrayList<>();
        for (Proposal proposal : proposals) {
            result.add(toResponse(proposal));
        }
        return result;
    }

    public ProposalResponse get(Long id) {
        return toResponse(find(id));
    }

    public ProposalResponse create(ProposalRequest request) {
        Proposal proposal = new Proposal();
        proposal.setCompanyName(request.companyName());
        proposal.setContactName(request.contactName());
        proposal.setEmail(request.email());
        proposal.setPhone(request.phone());
        proposal.setTitle(request.title());
        proposal.setEventType(request.eventType());
        proposal.setExpectedDate(parseDate(request.expectedDate()));
        proposal.setExpectedAttendance(request.expectedAttendance());
        proposal.setBudget(request.budget());
        proposal.setMessage(request.message());
        return toResponse(proposalRepository.save(proposal));
    }

    public ProposalResponse updateStatus(Long id, String status) {
        if (!STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Status must be one of: Pending, Under Review, Accepted, Rejected");
        }
        Proposal proposal = find(id);
        proposal.setStatus(status);
        return toResponse(proposalRepository.save(proposal));
    }

    @Transactional
    public ProposalResponse convertToEvent(Long id, Long venueId) {
        Proposal proposal = find(id);

        if (proposal.getEventId() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This proposal is already converted to an event");
        }
        if (venueId == null || !venueRepository.existsById(venueId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid venue");
        }

        Event event = new Event();
        event.setTitle(proposal.getTitle());
        event.setCategory(proposal.getEventType());
        event.setStatus("Draft");
        event.setVenueId(venueId);
        event.setEventDate(proposal.getExpectedDate());
        event.setHeadliner(proposal.getCompanyName());
        Event saved = eventRepository.save(event);

        proposal.setEventId(saved.getId());
        proposal.setStatus("Accepted");
        return toResponse(proposalRepository.save(proposal));
    }

    public void delete(Long id) {
        proposalRepository.delete(find(id));
    }

    private Proposal find(Long id) {
        return proposalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proposal not found"));
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

    private ProposalResponse toResponse(Proposal proposal) {
        return new ProposalResponse(
                proposal.getId(),
                proposal.getCompanyName(),
                proposal.getContactName(),
                proposal.getEmail(),
                proposal.getPhone(),
                proposal.getTitle(),
                proposal.getEventType(),
                proposal.getExpectedDate() == null ? null : proposal.getExpectedDate().toString(),
                proposal.getExpectedAttendance(),
                proposal.getBudget(),
                proposal.getMessage(),
                proposal.getStatus(),
                proposal.getEventId(),
                proposal.getCreatedAt().toString()
        );
    }
}