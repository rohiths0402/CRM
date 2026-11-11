package com.productionhouse.crm.controller;

import com.productionhouse.crm.dto.AuthResponse;
import com.productionhouse.crm.dto.ForgotPasswordRequest;
import com.productionhouse.crm.dto.LoginRequest;
import com.productionhouse.crm.dto.MessageResponse;
import com.productionhouse.crm.dto.RegisterRequest;
import com.productionhouse.crm.dto.ResetPasswordRequest;
import com.productionhouse.crm.dto.UserResponse;
import com.productionhouse.crm.dto.VerifyOtpRequest;
import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = authService.register(request);
        return Map.of("message", "Account created successfully.", "user", user);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.sendPasswordResetOtp(request.email());
        return new MessageResponse("If an account exists for that email, an OTP has been sent.");
    }

    @PostMapping("/verify-otp")
    public MessageResponse verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request);
        return new MessageResponse("OTP verified.");
    }

    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return new MessageResponse("Your password has been reset. Please sign in.");
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal User user) {
        return UserResponse.from(user);
    }
}
