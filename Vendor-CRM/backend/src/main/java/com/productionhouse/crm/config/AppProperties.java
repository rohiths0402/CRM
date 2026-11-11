package com.productionhouse.crm.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Otp otp, Mail mail, Cors cors) {

    public record Jwt(String secret, long expirationMinutes, long rememberMeExpirationDays) {
    }

    public record Otp(int length, long expiryMinutes, int maxAttempts, long resendCooldownSeconds) {
    }

    /** logOnly writes OTPs to the log instead of emailing them; for local testing only. */
    public record Mail(String from, String fromName, boolean logOnly) {
    }

    public record Cors(List<String> allowedOrigins) {
    }
}
