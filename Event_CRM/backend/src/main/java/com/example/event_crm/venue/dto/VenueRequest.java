package com.example.event_crm.venue.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record VenueRequest(
        @NotBlank(message = "Venue name is required") String name,
        String type,
        @NotBlank(message = "City is required") String city,
        String stateSlug,
        String address,
        Double lat,
        Double lng,
        @Min(value = 1, message = "Capacity must be at least 1") int capacity,
        int parkingStalls,
        long baseRent,
        int greenRooms,
        boolean powerBackup,
        boolean wheelchairAccess,
        String fireNocValidTill,
        String contactName,
        String contactPhone
) {
}