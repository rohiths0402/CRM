package com.example.event_crm.auth;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/forgot-password")
public class PasswordResetController {

    private final PasswordResetService service;

    public PasswordResetController(PasswordResetService service) {
        this.service = service;
    }

    @PostMapping("/send-otp")
    public Map<String, String> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        service.sendOtp(request.identifier());
        return Map.of("message", "OTP sent");
    }

    @PostMapping("/verify-otp")
    public Map<String, String> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return Map.of("resetToken", service.verifyOtp(request.identifier(), request.otp()));
    }

    @PostMapping("/reset")
    public Map<String, String> reset(@Valid @RequestBody ResetPasswordRequest request) {
        service.reset(request.identifier(), request.resetToken(), request.newPassword());
        return Map.of("message", "Password updated");
    }
}