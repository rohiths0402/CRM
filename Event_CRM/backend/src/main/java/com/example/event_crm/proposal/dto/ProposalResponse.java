package com.example.event_crm.proposal.dto;

public record ProposalResponse(
        Long id,
        String companyName,
        String contactName,
        String email,
        String phone,
        String title,
        String eventType,
        String expectedDate,
        int expectedAttendance,
        long budget,
        String message,
        String status,
        Long eventId,
        String createdAt
) {
}