package com.example.event_crm.event.dto;

import jakarta.validation.constraints.NotBlank;

public record EventRequest(
        @NotBlank(message = "Event title is required") String title,
        String category,
        String ageRating,
        String headliner,
        String description,
        String bannerUrl,
        Long venueId,
        String date,
        String gatesOpen,
        String showStart,
        String curfew,
        int capacity,
        long budget,
        long projectedRevenue
) {
}