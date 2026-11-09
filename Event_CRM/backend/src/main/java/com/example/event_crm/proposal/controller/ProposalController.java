package com.example.event_crm.proposal.controller;

import com.example.event_crm.proposal.dto.ConvertRequest;
import com.example.event_crm.proposal.dto.ProposalRequest;
import com.example.event_crm.proposal.dto.ProposalResponse;
import com.example.event_crm.proposal.dto.ProposalStatusRequest;
import com.example.event_crm.proposal.service.ProposalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proposals")
public class ProposalController {

    private final ProposalService proposalService;

    public ProposalController(ProposalService proposalService) {
        this.proposalService = proposalService;
    }

    @GetMapping
    public List<ProposalResponse> list(@RequestParam(required = false) String status) {
        return proposalService.list(status);
    }

    @GetMapping("/{id}")
    public ProposalResponse get(@PathVariable Long id) {
        return proposalService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProposalResponse create(@Valid @RequestBody ProposalRequest request) {
        return proposalService.create(request);
    }

    @PutMapping("/{id}/status")
    public ProposalResponse updateStatus(@PathVariable Long id, @RequestBody ProposalStatusRequest request) {
        return proposalService.updateStatus(id, request.status());
    }

    @PostMapping("/{id}/convert")
    public ProposalResponse convert(@PathVariable Long id, @RequestBody ConvertRequest request) {
        return proposalService.convertToEvent(id, request.venueId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        proposalService.delete(id);
    }
}