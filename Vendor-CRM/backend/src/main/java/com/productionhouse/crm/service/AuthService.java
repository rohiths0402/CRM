package com.productionhouse.crm.service;

import com.productionhouse.crm.config.AppProperties;
import com.productionhouse.crm.dto.AuthResponse;
import com.productionhouse.crm.dto.LoginRequest;
import com.productionhouse.crm.dto.RegisterRequest;
import com.productionhouse.crm.dto.ResetPasswordRequest;
import com.productionhouse.crm.dto.UserResponse;
import com.productionhouse.crm.dto.VerifyOtpRequest;
import com.productionhouse.crm.entity.PasswordResetOtp;
import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.exception.ApiException;
import com.productionhouse.crm.repository.PasswordResetOtpRepository;
import com.productionhouse.crm.repository.UserRepository;
import com.productionhouse.crm.security.JwtService;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AuthService {

    private static final String INVALID_CREDENTIALS = "Invalid email or password.";
    private static final String INVALID_OTP = "Invalid or expired OTP. Please request a new one.";

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AppProperties.Otp otpProperties;
    private final SecureRandom random = new SecureRandom();

    // Compared against when the email is unknown so login takes the same time either way.
    private final String dummyHash;

    public AuthService(UserRepository userRepository, PasswordResetOtpRepository otpRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService, EmailService emailService,
                       AppProperties properties) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.otpProperties = properties.otp();
        this.dummyHash = passwordEncoder.encode("dummy-password-for-timing");
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setCompany(request.company().trim());
        user.setEmail(email);
        user.setMobile(StringUtils.hasText(request.mobile()) ? request.mobile().trim() : null);
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Optional<User> found = userRepository.findByEmail(normalizeEmail(request.email()));

        if (found.isEmpty()) {
            passwordEncoder.matches(request.password(), dummyHash);
            throw new ApiException(HttpStatus.UNAUTHORIZED, INVALID_CREDENTIALS);
        }

        User user = found.get();
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, INVALID_CREDENTIALS);
        }

        Duration ttl = jwtService.ttl(request.rememberMe());
        return new AuthResponse("Signed in successfully.", jwtService.generateToken(user, request.rememberMe()),
                "Bearer", ttl.toSeconds(), UserResponse.from(user));
    }

    /**
     * Emails a fresh OTP if the account exists. Unknown emails and requests inside the
     * resend cooldown return normally, so the response never reveals whether an email
     * is registered. If sending fails the transaction rolls back and no OTP is stored.
     */
    @Transactional
    public void sendPasswordResetOtp(String rawEmail) {
        Optional<User> found = userRepository.findByEmail(normalizeEmail(rawEmail));
        if (found.isEmpty()) {
            return;
        }
        User user = found.get();

        Instant cooldownEnd = Instant.now().minusSeconds(otpProperties.resendCooldownSeconds());
        boolean inCooldown = otpRepository.findFirstByUserOrderByCreatedAtDesc(user)
                .map(latest -> latest.getCreatedAt().isAfter(cooldownEnd))
                .orElse(false);
        if (inCooldown) {
            return;
        }

        otpRepository.invalidateAllForUser(user);

        String code = generateOtp();
        PasswordResetOtp otp = new PasswordResetOtp();
        otp.setUser(user);
        otp.setOtpHash(passwordEncoder.encode(code));
        otp.setExpiresAt(Instant.now().plus(Duration.ofMinutes(otpProperties.expiryMinutes())));
        otpRepository.save(otp);

        emailService.sendPasswordResetOtp(user.getEmail(), user.getFullName(), code, otpProperties.expiryMinutes());
    }

    // noRollbackFor keeps the failed-attempt counter when a wrong OTP throws.
    @Transactional(noRollbackFor = ApiException.class)
    public void verifyOtp(VerifyOtpRequest request) {
        checkOtp(request.email(), request.otp());
    }

    @Transactional(noRollbackFor = ApiException.class)
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetOtp otp = checkOtp(request.email(), request.otp());
        User user = otp.getUser();

        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);
        otpRepository.invalidateAllForUser(user);
    }

    private PasswordResetOtp checkOtp(String rawEmail, String code) {
        User user = userRepository.findByEmail(normalizeEmail(rawEmail))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, INVALID_OTP));

        PasswordResetOtp otp = otpRepository.findFirstByUserAndUsedFalseOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, INVALID_OTP));

        if (otp.isExpired() || otp.getAttempts() >= otpProperties.maxAttempts()) {
            otp.setUsed(true);
            otpRepository.save(otp);
            throw new ApiException(HttpStatus.BAD_REQUEST, INVALID_OTP);
        }

        if (!passwordEncoder.matches(code, otp.getOtpHash())) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);
            int remaining = otpProperties.maxAttempts() - otp.getAttempts();
            throw new ApiException(HttpStatus.BAD_REQUEST, remaining > 0
                    ? "Incorrect OTP. " + remaining + " attempt(s) left."
                    : INVALID_OTP);
        }

        return otp;
    }

    private String generateOtp() {
        int length = otpProperties.length();
        int bound = (int) Math.pow(10, length);
        return String.format("%0" + length + "d", random.nextInt(bound));
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
