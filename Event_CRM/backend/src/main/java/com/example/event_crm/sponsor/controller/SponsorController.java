package com.example.event_crm.sponsor.controller;

import com.example.event_crm.sponsor.dto.DeliverableRequest;
import com.example.event_crm.sponsor.dto.DeliverableStatusRequest;
import com.example.event_crm.sponsor.dto.SponsorListResponse;
import com.example.event_crm.sponsor.dto.SponsorRequest;
import com.example.event_crm.sponsor.dto.SponsorResponse;
import com.example.event_crm.sponsor.service.SponsorService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sponsors")
public class SponsorController {

    private final SponsorService sponsorService;

    public SponsorController(SponsorService sponsorService) {
        this.sponsorService = sponsorService;
    }

    @GetMapping
    public SponsorListResponse list() {
        return new SponsorListResponse(sponsorService.list());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SponsorResponse create(@RequestBody SponsorRequest request) {
        return sponsorService.create(request);
    }

    @PutMapping("/{id}")
    public SponsorResponse update(@PathVariable Long id, @RequestBody SponsorRequest request) {
        return sponsorService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        sponsorService.delete(id);
    }

    @PostMapping("/{id}/deliverables")
    @ResponseStatus(HttpStatus.CREATED)
    public SponsorResponse addDeliverable(@PathVariable Long id, @RequestBody DeliverableRequest request) {
        return sponsorService.addDeliverable(id, request);
    }

    @PutMapping("/{id}/deliverables/{deliverableId}")
    public SponsorResponse updateDeliverable(@PathVariable Long id, @PathVariable Long deliverableId,
                                             @RequestBody DeliverableRequest request) {
        return sponsorService.updateDeliverable(id, deliverableId, request);
    }

    @PatchMapping("/{id}/deliverables/{deliverableId}")
    public SponsorResponse updateDeliverableStatus(@PathVariable Long id, @PathVariable Long deliverableId,
                                                   @RequestBody DeliverableStatusRequest request) {
        return sponsorService.updateDeliverableStatus(id, deliverableId, request.status());
    }

    @DeleteMapping("/{id}/deliverables/{deliverableId}")
    public SponsorResponse deleteDeliverable(@PathVariable Long id, @PathVariable Long deliverableId) {
        return sponsorService.deleteDeliverable(id, deliverableId);
    }
}