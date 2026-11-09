package com.example.event_crm.auth;

import com.example.event_crm.user.model.AppUser;
import com.example.event_crm.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository users;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository contextRepository = new HttpSessionSecurityContextRepository();

    public AuthService(UserRepository users, AuthenticationManager authenticationManager) {
        this.users = users;
        this.authenticationManager = authenticationManager;
    }

    public UserResponse login(String emailText, String password,
                              HttpServletRequest request, HttpServletResponse response) {
        String email = emailText.trim().toLowerCase();
        AppUser user = users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect."));

        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This account is disabled.");
        }
        if (user.isLocked()) {
            throw new ResponseStatusException(HttpStatus.LOCKED, "Too many wrong attempts. Try again after 15 minutes.");
        }

        Authentication auth;
        try {
            auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        } catch (AuthenticationException ex) {
            wrongPassword(user);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect.");
        }

        user.setFailedLogins(0);
        user.setLockedUntil(null);
        users.save(user);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, request, response);

        return toResponse(user);
    }

    public UserResponse me(String email) {
        AppUser user = users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in."));
        return toResponse(user);
    }

    public void logout(HttpServletRequest request) {
        if (request.getSession(false) != null) {
            request.getSession(false).invalidate();
        }
        SecurityContextHolder.clearContext();
    }

    private void wrongPassword(AppUser user) {
        int failed = user.getFailedLogins() + 1;
        if (failed >= 5) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(15));
            failed = 0;
        }
        user.setFailedLogins(failed);
        users.save(user);
    }

    private UserResponse toResponse(AppUser u) {
        return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole(),
                u.getPhone(), u.getEmployeeId(), u.getDesignation(), u.getShift());
    }
}