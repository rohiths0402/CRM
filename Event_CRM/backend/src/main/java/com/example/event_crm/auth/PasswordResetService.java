package com.example.event_crm.auth;

import com.example.event_crm.user.model.AppUser;
import com.example.event_crm.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository users;
    private final PasswordOtpRepository otps;
    private final PasswordEncoder encoder;
    private final MailService mail;
    private final SmsService sms;

    public PasswordResetService(UserRepository users, PasswordOtpRepository otps,
                                PasswordEncoder encoder, MailService mail, SmsService sms) {
        this.users = users;
        this.otps = otps;
        this.encoder = encoder;
        this.mail = mail;
        this.sms = sms;
    }

    @Transactional
    public void sendOtp(String identifierText) {
        String identifier = clean(identifierText);
        AppUser user = findUser(identifier);

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        otps.deleteByIdentifier(identifier);

        PasswordOtp otp = new PasswordOtp();
        otp.setIdentifier(identifier);
        otp.setCodeHash(encoder.encode(code));
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        otps.save(otp);

        if (identifier.contains("@")) {
            mail.sendCode(user.getEmail(), user.getName(), code);
        } else {
            sms.sendCode(identifier, code);
        }
    }

    public String verifyOtp(String identifierText, String code) {
        String identifier = clean(identifierText);
        PasswordOtp otp = otps.findFirstByIdentifierOrderByIdDesc(identifier)
                .orElseThrow(this::badCode);

        if (otp.getCodeHash() == null || otp.getAttempts() >= 5
                || otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw badCode();
        }
        if (!encoder.matches(code.trim(), otp.getCodeHash())) {
            otp.setAttempts(otp.getAttempts() + 1);
            otps.save(otp);
            throw badCode();
        }

        String token = UUID.randomUUID().toString();
        otp.setCodeHash(null);
        otp.setResetTokenHash(encoder.encode(token));
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        otps.save(otp);
        return token;
    }

    @Transactional
    public void reset(String identifierText, String token, String newPassword) {
        String identifier = clean(identifierText);
        PasswordOtp otp = otps.findFirstByIdentifierOrderByIdDesc(identifier)
                .orElseThrow(this::expired);

        if (otp.getResetTokenHash() == null || otp.getExpiresAt().isBefore(LocalDateTime.now())
                || !encoder.matches(token, otp.getResetTokenHash())) {
            throw expired();
        }

        AppUser user = findUser(identifier);
        user.setPasswordHash(encoder.encode(newPassword));
        user.setFailedLogins(0);
        user.setLockedUntil(null);
        users.save(user);
        otps.deleteByIdentifier(identifier);
    }

    private AppUser findUser(String identifier) {
        var found = identifier.contains("@") ? users.findByEmail(identifier) : users.findByPhone(identifier);
        return found.orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "No account found with these details"));
    }

    private String clean(String value) {
        String text = value.trim().toLowerCase();
        if (text.contains("@")) {
            return text.replaceAll("\\s", "");
        }
        String digits = text.replaceAll("\\D", "");
        return digits.length() > 10 ? digits.substring(digits.length() - 10) : digits;
    }

    private ResponseStatusException badCode() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect or expired code");
    }

    private ResponseStatusException expired() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "This reset has expired. Please start again.");
    }
}