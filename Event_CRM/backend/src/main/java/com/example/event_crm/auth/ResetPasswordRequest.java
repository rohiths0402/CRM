package com.example.event_crm.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank String identifier,
        @NotBlank String resetToken,
        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters.") String newPassword) {
}