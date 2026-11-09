package com.example.event_crm.event.dto;

public record EventResponse(
        Long id,
        String title,
        String category,
        String ageRating,
        String status,
        Long venueId,
        String venueName,
        String city,
        int capacity,
        String eventDate,
        String gatesOpen,
        String showStart,
        String curfewTime,
        String bannerUrl,
        long targetBudget,
        long projectedRevenue) {
}