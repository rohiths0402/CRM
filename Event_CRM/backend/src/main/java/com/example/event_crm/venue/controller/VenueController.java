package com.example.event_crm.venue.controller;

import com.example.event_crm.venue.dto.VenueListResponse;
import com.example.event_crm.venue.dto.VenueRequest;
import com.example.event_crm.venue.dto.VenueResponse;
import com.example.event_crm.venue.dto.ZoneRequest;
import com.example.event_crm.venue.service.VenueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    private final VenueService venueService;

    public VenueController(VenueService venueService) {
        this.venueService = venueService;
    }

    @GetMapping
    public VenueListResponse list() {
        return new VenueListResponse(venueService.list());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VenueResponse create(@Valid @RequestBody VenueRequest request) {
        return venueService.create(request);
    }

    @PutMapping("/{id}")
    public VenueResponse update(@PathVariable Long id, @Valid @RequestBody VenueRequest request) {
        return venueService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        venueService.delete(id);
    }

    @PostMapping("/{id}/zones")
    @ResponseStatus(HttpStatus.CREATED)
    public VenueResponse addZone(@PathVariable Long id, @RequestBody ZoneRequest request) {
        return venueService.addZone(id, request);
    }

    @PutMapping("/{id}/zones/{zoneId}")
    public VenueResponse updateZone(@PathVariable Long id, @PathVariable Long zoneId,
                                    @RequestBody ZoneRequest request) {
        return venueService.updateZone(id, zoneId, request);
    }

    @DeleteMapping("/{id}/zones/{zoneId}")
    public VenueResponse removeZone(@PathVariable Long id, @PathVariable Long zoneId) {
        return venueService.removeZone(id, zoneId);
    }
}