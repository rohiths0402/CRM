package com.example.event_crm.lineup.controller;

import com.example.event_crm.lineup.dto.RiderItemRequest;
import com.example.event_crm.lineup.dto.RiderItemStatusRequest;
import com.example.event_crm.lineup.dto.RiderRequest;
import com.example.event_crm.lineup.dto.SlotListResponse;
import com.example.event_crm.lineup.dto.SlotRequest;
import com.example.event_crm.lineup.dto.SlotResponse;
import com.example.event_crm.lineup.service.LineupService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lineups")
public class LineupController {

    private final LineupService lineupService;

    public LineupController(LineupService lineupService) {
        this.lineupService = lineupService;
    }

    @GetMapping
    public SlotListResponse list(@RequestParam(required = false) Long eventId) {
        return new SlotListResponse(lineupService.list(eventId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SlotResponse create(@RequestBody SlotRequest request) {
        return lineupService.create(request);
    }

    @PutMapping("/{id}")
    public SlotResponse update(@PathVariable Long id, @RequestBody SlotRequest request) {
        return lineupService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        lineupService.delete(id);
    }

    @PutMapping("/{id}/rider")
    public SlotResponse updateRider(@PathVariable Long id, @RequestBody RiderRequest request) {
        return lineupService.updateRider(id, request);
    }

    @PostMapping("/{id}/rider-items")
    @ResponseStatus(HttpStatus.CREATED)
    public SlotResponse addRiderItem(@PathVariable Long id, @RequestBody RiderItemRequest request) {
        return lineupService.addRiderItem(id, request);
    }

    @PatchMapping("/{id}/rider-items/{itemId}")
    public SlotResponse updateRiderItemStatus(@PathVariable Long id, @PathVariable Long itemId,
                                              @RequestBody RiderItemStatusRequest request) {
        return lineupService.updateRiderItemStatus(id, itemId, request.status());
    }

    @DeleteMapping("/{id}/rider-items/{itemId}")
    public SlotResponse removeRiderItem(@PathVariable Long id, @PathVariable Long itemId) {
        return lineupService.removeRiderItem(id, itemId);
    }
}