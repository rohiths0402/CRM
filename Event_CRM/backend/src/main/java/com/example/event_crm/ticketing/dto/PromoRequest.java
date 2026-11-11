package com.example.event_crm.ticketing.dto;

public record PromoRequest(
        String code,
        String discountType,
        long value,
        Long eventId,
        int maxUses,
        String expiresOn
) {
}