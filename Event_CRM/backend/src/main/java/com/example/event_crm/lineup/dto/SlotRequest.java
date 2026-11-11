package com.example.event_crm.lineup.dto;

public record SlotRequest(
        Long eventId,
        String artistName,
        String role,
        String stage,
        String start,
        String end,
        String soundcheck,
        Integer greenRoom,
        String status,
        long fee,
        long advancePaid,
        String managerName,
        String managerPhone,
        Boolean addStandardRider
) {
}