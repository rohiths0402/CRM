package com.example.event_crm.event.dto;

public record EventLocation(
        Long id,
        String title,
        String category,
        String ageRating,
        String status,
        String headliner,
        String description,
        Long venueId,
        String venue,
        String city,
        String stateSlug,
        double lat,
        double lng,
        String date,
        String gatesOpen,
        String showStart,
        String curfew,
        int capacity,
        long ticketsSold,
        long grossRevenue,
        long sponsors,
        long budget,
        long projectedRevenue,
        String bannerUrl
) {
}