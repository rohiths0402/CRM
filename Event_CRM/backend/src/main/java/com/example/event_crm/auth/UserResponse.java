package com.example.event_crm.auth;

public record UserResponse(
        Long id,
        String name,
        String email,
        String role,
        String phone,
        String employeeId,
        String designation,
        String shift) {
}