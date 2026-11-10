package com.example.event_crm.venue.dto;

public record ZoneRequest(
        String name,
        String kind,
        int capacity,
        int fireExits,
        String safetyStatus,
        String lastInspection
) {
}