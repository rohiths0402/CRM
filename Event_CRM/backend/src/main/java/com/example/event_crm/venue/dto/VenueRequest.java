package com.example.event_crm.venue.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record VenueRequest(
        @NotBlank(message = "Enter the venue name.") String name,
        @NotBlank(message = "Enter the city.") String city,
        String address,
        @Min(value = 1, message = "Capacity must be more than zero.") int capacity,
        @Min(0) int parkingCapacity,
        @Min(0) long baseRentalCost) {
}