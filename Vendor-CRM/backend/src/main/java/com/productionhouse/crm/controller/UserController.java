package com.productionhouse.crm.controller;

import com.productionhouse.crm.dto.CreateUserRequest;
import com.productionhouse.crm.dto.UpdateUserRequest;
import com.productionhouse.crm.dto.UserResponse;
import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.exception.ApiException;
import com.productionhouse.crm.repository.PasswordResetOtpRepository;
import com.productionhouse.crm.repository.UserRepository;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** The workspace admin's user management. SecurityConfig limits /users to admins. */
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordResetOtpRepository otpRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** The admin first, then the logins they added, oldest first. */
    @GetMapping
    public List<UserResponse> list(@AuthenticationPrincipal User admin) {
        List<UserResponse> users = new ArrayList<>();
        users.add(UserResponse.from(admin));
        userRepository.findAllByWorkspaceOwnerIdOrderByCreatedAtAsc(admin.getId())
                .forEach(user -> users.add(UserResponse.from(user)));
        return users;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public UserResponse create(@AuthenticationPrincipal User admin, @Valid @RequestBody CreateUserRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setCompany(admin.getCompany());
        user.setEmail(email);
        user.setMobile(StringUtils.hasText(request.mobile()) ? request.mobile().trim() : null);
        user.setAccess(request.access());
        user.setWorkspaceOwnerId(admin.getId());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        return UserResponse.from(userRepository.save(user));
    }

    @PutMapping("/{id}")
    @Transactional
    public UserResponse update(@AuthenticationPrincipal User admin, @PathVariable Long id,
                               @Valid @RequestBody UpdateUserRequest request) {
        User user = member(admin, id);
        user.setFullName(request.fullName().trim());
        user.setMobile(StringUtils.hasText(request.mobile()) ? request.mobile().trim() : null);
        user.setAccess(request.access());
        return UserResponse.from(userRepository.save(user));
    }

    /** The user's records stay: they belong to the workspace, not to the login. */
    @DeleteMapping("/{id}")
    @Transactional
    public Map<String, Object> delete(@AuthenticationPrincipal User admin, @PathVariable Long id) {
        User user = member(admin, id);
        otpRepository.deleteAllForUser(user);
        userRepository.delete(user);
        return Map.of("success", true, "message", "User deleted.");
    }

    private User member(User admin, Long id) {
        if (admin.getId().equals(id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "The admin account can't be changed or deleted here.");
        }
        return userRepository.findById(id)
                .filter(user -> admin.getId().equals(user.getWorkspaceOwnerId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));
    }
}
