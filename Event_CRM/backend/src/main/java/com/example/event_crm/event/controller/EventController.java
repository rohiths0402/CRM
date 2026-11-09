package com.example.event_crm.event.controller;

import com.example.event_crm.event.dto.EventRequest;
import com.example.event_crm.event.dto.EventResponse;
import com.example.event_crm.event.dto.StatusRequest;
import com.example.event_crm.event.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService service;

    public EventController(EventService service) {
        this.service = service;
    }

    @GetMapping
    public List<EventResponse> list(@RequestParam(required = false) String status) {
        return service.list(status);
    }

    @GetMapping("/{id}")
    public EventResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public EventResponse add(@Valid @RequestBody EventRequest request) {
        return service.add(request);
    }

    @PutMapping("/{id}")
    public EventResponse update(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
        return service.update(id, request);
    }

    @PutMapping("/{id}/status")
    public EventResponse changeStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest request) {
        return service.changeStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}