package com.example.event_crm.sponsor.dto;

import java.util.List;

public record SponsorResponse(
        Long id,
        Long eventId,
        String eventTitle,
        String eventDate,
        String eventStatus,
        String brandName,
        String industry,
        String tier,
        long contractValue,
        long amountReceived,
        String paymentStatus,
        String contactName,
        String contactEmail,
        String contactPhone,
        String contractFileName,
        Long contractFileSize,
        String contractFileUrl,
        List<DeliverableResponse> deliverables
) {
}