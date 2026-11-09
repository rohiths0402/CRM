package com.example.event_crm.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest body,
                               HttpServletRequest request, HttpServletResponse response) {
        UserResponse user = service.login(body.email(), body.password(), request, response);
        return new LoginResponse("session", user);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request) {
        service.logout(request);
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return service.me(authentication.getName());
    }
}