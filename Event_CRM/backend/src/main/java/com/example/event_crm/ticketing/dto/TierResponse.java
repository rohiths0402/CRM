package com.example.event_crm.ticketing.dto;

public record TierResponse(
        Long id,
        Long eventId,
        String eventTitle,
        String eventStatus,
        String name,
        String perks,
        long price,
        int taxPercentage,
        int quota,
        int sold,
        int maxPerOrder,
        String status
) {
}