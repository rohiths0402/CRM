package com.example.event_crm.ticketing.dto;

public record TierRequest(
        Long eventId,
        String name,
        String perks,
        long price,
        int taxPercentage,
        int quota,
        int maxPerOrder
) {
}