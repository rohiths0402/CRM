package com.example.event_crm.ticketing.dto;

public record PromoResponse(
        Long id,
        String code,
        String discountType,
        long value,
        Long eventId,
        int maxUses,
        int used,
        String expiresOn,
        boolean enabled
) {
}