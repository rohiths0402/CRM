package com.example.event_crm.lineup.dto;

import java.util.List;

public record SlotResponse(
        Long id,
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
        String managerEmail,
        String dietaryNotes,
        String soundRigNotes,
        String securityNotes,
        boolean escortRequired,
        List<RiderItemResponse> riderItems
) {
}