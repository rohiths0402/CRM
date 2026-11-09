package com.example.event_crm.event.dto;

public record EventLocation(
        Long id,
        String title,
        String category,
        String status,
        String stateSlug,
        String city,
        String venue,
        double lat,
        double lng,
        String date,
        String gatesOpen,
        String showStart,
        int capacity,
        long ticketsSold,
        long grossRevenue,
        long sponsors,
        String headliner
) {
}