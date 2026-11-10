package com.example.event_crm.venue.dto;

import java.util.List;

public record VenueResponse(
        Long id,
        String name,
        String type,
        String city,
        String stateSlug,
        String address,
        Double lat,
        Double lng,
        int capacity,
        int parkingStalls,
        long baseRent,
        int greenRooms,
        boolean powerBackup,
        boolean wheelchairAccess,
        String fireNocValidTill,
        String contactName,
        String contactPhone,
        long eventsCount,
        List<ZoneResponse> zones
) {
}