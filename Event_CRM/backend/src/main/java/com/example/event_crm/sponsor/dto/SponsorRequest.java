package com.example.event_crm.sponsor.dto;

public record SponsorRequest(
        Long eventId,
        String brandName,
        String industry,
        String tier,
        long contractValue,
        long amountReceived,
        String contactName,
        String contactEmail,
        String contactPhone,
        ContractFileInfo contractFile,
        Boolean addStandardDeliverables
) {
}