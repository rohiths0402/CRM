package com.example.event_crm.venue.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ZoneRequest(
        @NotBlank(message = "Enter the zone name.") String name,
        @Min(value = 1, message = "Zone capacity must be more than zero.") int capacity,
        boolean fireExitVerified) {
}