package com.productionhouse.crm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Email address is required.")
        @Email(message = "Enter a valid email address.")
        String email,

        @NotBlank(message = "OTP is required.")
        @Pattern(regexp = ValidationRules.OTP_REGEX, message = ValidationRules.OTP_MESSAGE)
        String otp,

        @NotBlank(message = "New password is required.")
        @Size(max = 72, message = "Password must be at most 72 characters.")
        @Pattern(regexp = ValidationRules.PASSWORD_REGEX, message = ValidationRules.PASSWORD_MESSAGE)
        String password) {
}
