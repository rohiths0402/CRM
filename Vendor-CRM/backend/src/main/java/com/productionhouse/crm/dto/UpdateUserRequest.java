package com.productionhouse.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** The email and password stay with the user; they change their password through Forgot password. */
public record UpdateUserRequest(
        @NotBlank(message = "Full name is required.")
        @Size(max = 120, message = "Full name must be at most 120 characters.")
        String fullName,

        @Pattern(regexp = "^$|" + ValidationRules.MOBILE_REGEX, message = ValidationRules.MOBILE_MESSAGE)
        String mobile,

        @NotBlank(message = "Access is required.")
        @Pattern(regexp = ValidationRules.ACCESS_REGEX, message = ValidationRules.ACCESS_MESSAGE)
        String access) {
}
