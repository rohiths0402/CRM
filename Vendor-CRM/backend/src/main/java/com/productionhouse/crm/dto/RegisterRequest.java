package com.productionhouse.crm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Full name is required.")
        @Size(max = 120, message = "Full name must be at most 120 characters.")
        String fullName,

        @NotBlank(message = "Company name is required.")
        @Size(max = 150, message = "Company name must be at most 150 characters.")
        String company,

        @NotBlank(message = "Email address is required.")
        @Email(message = "Enter a valid email address.")
        @Size(max = 254, message = "Email address is too long.")
        String email,

        // Optional so older clients that do not send it still work.
        @Pattern(regexp = ValidationRules.MOBILE_REGEX, message = ValidationRules.MOBILE_MESSAGE)
        String mobile,

        @NotBlank(message = "Password is required.")
        @Size(max = 72, message = "Password must be at most 72 characters.")
        @Pattern(regexp = ValidationRules.PASSWORD_REGEX, message = ValidationRules.PASSWORD_MESSAGE)
        String password) {
}
