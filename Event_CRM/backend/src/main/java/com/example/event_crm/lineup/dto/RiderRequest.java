package com.example.event_crm.lineup.dto;

public record RiderRequest(
        String managerName,
        String managerPhone,
        String managerEmail,
        String dietaryNotes,
        String soundRigNotes,
        String securityNotes,
        Boolean escortRequired
) {
}