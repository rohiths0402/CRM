package com.example.event_crm.event.controller;

import com.example.event_crm.event.dto.EventLocationsResponse;
import com.example.event_crm.event.service.EventLocationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
public class EventLocationController {

    private final EventLocationService eventLocationService;

    public EventLocationController(EventLocationService eventLocationService) {
        this.eventLocationService = eventLocationService;
    }

    @GetMapping("/locations")
    public EventLocationsResponse locations() {
        return new EventLocationsResponse(eventLocationService.all());
    }
}