package com.example.event_crm.auth;

import jakarta.validation.constraints.NotBlank;

public record SendOtpRequest(
        @NotBlank(message = "Enter your email or mobile number.") String identifier,
        String method) {
}