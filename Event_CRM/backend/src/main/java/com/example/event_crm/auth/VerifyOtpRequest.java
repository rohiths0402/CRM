package com.example.event_crm.auth;

import jakarta.validation.constraints.NotBlank;

public record VerifyOtpRequest(
        @NotBlank String identifier,
        @NotBlank(message = "Enter the 6 digit code.") String otp) {
}