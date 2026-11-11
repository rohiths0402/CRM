package com.productionhouse.crm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyOtpRequest(
        @NotBlank(message = "Email address is required.")
        @Email(message = "Enter a valid email address.")
        String email,

        @NotBlank(message = "OTP is required.")
        @Pattern(regexp = ValidationRules.OTP_REGEX, message = ValidationRules.OTP_MESSAGE)
        String otp) {
}
