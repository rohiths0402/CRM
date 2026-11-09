package com.example.event_crm.venue.dto;

import java.util.List;

public record VenueResponse(
        Long id,
        String name,
        String city,
        String address,
        int capacity,
        int parkingCapacity,
        long baseRentalCost,
        List<Zone> zones) {

    public record Zone(Long id, String name, int capacity, int soldCount, boolean fireExitVerified) {}
}