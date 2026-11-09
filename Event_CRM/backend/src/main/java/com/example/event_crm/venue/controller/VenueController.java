package com.example.event_crm.venue.controller;

import com.example.event_crm.venue.dto.VenueRequest;
import com.example.event_crm.venue.dto.VenueResponse;
import com.example.event_crm.venue.dto.ZoneRequest;
import com.example.event_crm.venue.service.VenueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    private final VenueService service;

    public VenueController(VenueService service) {
        this.service = service;
    }

    @GetMapping
    public List<VenueResponse> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public VenueResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public VenueResponse add(@Valid @RequestBody VenueRequest request) {
        return service.add(request);
    }

    @PutMapping("/{id}")
    public VenueResponse update(@PathVariable Long id, @Valid @RequestBody VenueRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PostMapping("/{id}/zones")
    public VenueResponse addZone(@PathVariable Long id, @Valid @RequestBody ZoneRequest request) {
        return service.addZone(id, request);
    }

    @PutMapping("/{id}/zones/{zoneId}")
    public VenueResponse updateZone(@PathVariable Long id, @PathVariable Long zoneId,
                                    @Valid @RequestBody ZoneRequest request) {
        return service.updateZone(id, zoneId, request);
    }

    @DeleteMapping("/{id}/zones/{zoneId}")
    public VenueResponse deleteZone(@PathVariable Long id, @PathVariable Long zoneId) {
        return service.deleteZone(id, zoneId);
    }
}