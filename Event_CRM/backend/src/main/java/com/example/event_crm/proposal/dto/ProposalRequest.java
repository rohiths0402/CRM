package com.example.event_crm.proposal.dto;

import jakarta.validation.constraints.NotBlank;

public record ProposalRequest(
        @NotBlank(message = "Company name is required") String companyName,
        String contactName,
        String email,
        String phone,
        @NotBlank(message = "Proposal title is required") String title,
        String eventType,
        String expectedDate,
        int expectedAttendance,
        long budget,
        String message
) {
}