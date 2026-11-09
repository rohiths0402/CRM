package com.example.event_crm.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record StatusRequest(
        @NotBlank
        @Pattern(regexp = "Draft|Announced|Tickets Live|Sold Out|Ongoing|Wrap",
                message = "Status is not valid.") String status) {
}