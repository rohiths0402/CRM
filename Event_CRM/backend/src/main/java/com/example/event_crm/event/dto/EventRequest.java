package com.example.event_crm.event.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;
import java.time.LocalTime;

public record EventRequest(
        @NotBlank(message = "Enter the event title.") String title,
        @NotBlank(message = "Choose a category.") String category,
        String ageRating,
        @Pattern(regexp = "Draft|Announced|Tickets Live|Sold Out|Ongoing|Wrap",
                message = "Status is not valid.") String status,
        @NotNull(message = "Choose a venue.") Long venueId,
        @NotNull(message = "Choose the event date.") LocalDate eventDate,
        LocalTime gatesOpen,
        LocalTime showStart,
        LocalTime curfewTime,
        String bannerUrl,
        @Min(0) long targetBudget,
        @Min(0) long projectedRevenue) {
}