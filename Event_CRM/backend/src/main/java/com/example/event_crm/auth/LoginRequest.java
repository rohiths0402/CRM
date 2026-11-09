package com.example.event_crm.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Enter your email.") String email,
        @NotBlank(message = "Enter your password.") String password) {
}