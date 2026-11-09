package com.example.event_crm.auth;

public record LoginResponse(String token, UserResponse user) {
}