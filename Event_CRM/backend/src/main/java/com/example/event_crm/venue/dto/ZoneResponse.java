package com.example.event_crm.venue.dto;

public record ZoneResponse(
        Long id,
        String name,
        String kind,
        int capacity,
        int sold,
        int fireExits,
        String safetyStatus,
        String lastInspection
) {
}