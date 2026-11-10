package com.example.event_crm.event.controller;

import com.example.event_crm.event.dto.EventLocation;
import com.example.event_crm.event.dto.EventLocationsResponse;
import com.example.event_crm.event.dto.EventRequest;
import com.example.event_crm.event.dto.StatusRequest;
import com.example.event_crm.event.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public EventLocationsResponse list() {
        return new EventLocationsResponse(eventService.list());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventLocation create(@Valid @RequestBody EventRequest request) {
        return eventService.create(request);
    }

    @PutMapping("/{id}")
    public EventLocation update(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
        return eventService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public EventLocation updateStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        return eventService.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        eventService.delete(id);
    }
}