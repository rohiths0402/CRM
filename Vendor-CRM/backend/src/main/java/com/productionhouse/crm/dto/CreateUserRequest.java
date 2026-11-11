package com.productionhouse.crm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** A login the workspace admin adds. The company is always the admin's. */
public record CreateUserRequest(
        @NotBlank(message = "Full name is required.")
        @Size(max = 120, message = "Full name must be at most 120 characters.")
        String fullName,

        @NotBlank(message = "Email address is required.")
        @Email(message = "Enter a valid email address.")
        @Size(max = 254, message = "Email address is too long.")
        String email,

        @Pattern(regexp = "^$|" + ValidationRules.MOBILE_REGEX, message = ValidationRules.MOBILE_MESSAGE)
        String mobile,

        @NotBlank(message = "Access is required.")
        @Pattern(regexp = ValidationRules.ACCESS_REGEX, message = ValidationRules.ACCESS_MESSAGE)
        String access,

        @NotBlank(message = "Password is required.")
        @Size(max = 72, message = "Password must be at most 72 characters.")
        @Pattern(regexp = ValidationRules.PASSWORD_REGEX, message = ValidationRules.PASSWORD_MESSAGE)
        String password) {
}
