package com.productionhouse.crm.service;

import com.productionhouse.crm.config.AppProperties;
import com.productionhouse.crm.exception.ApiException;
import jakarta.mail.MessagingException;
import java.io.UnsupportedEncodingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final AppProperties properties;

    public EmailService(JavaMailSender mailSender, AppProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    public void sendPasswordResetOtp(String to, String fullName, String otp, long expiryMinutes) {
        if (properties.mail().logOnly()) {
            log.warn("MAIL_LOG_ONLY is on, so no email was sent. Password reset OTP for {}: {}", to, otp);
            return;
        }

        String from = properties.mail().from();
        if (!StringUtils.hasText(from)) {
            log.error("Cannot send OTP email: MAIL_USERNAME / MAIL_FROM is not configured.");
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Email service is not configured. Please contact support.");
        }

        try {
            var message = mailSender.createMimeMessage();
            // Multipart is required to send both plain-text and HTML bodies.
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from, properties.mail().fromName());
            helper.setTo(to);
            helper.setSubject("Your password reset code");
            helper.setText(plainText(fullName, otp, expiryMinutes), html(fullName, otp, expiryMinutes));
            mailSender.send(message);
        } catch (MailException | MessagingException | UnsupportedEncodingException ex) {
            log.error("Failed to send OTP email to {}", to, ex);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Unable to send the verification email right now. Please try again later.");
        }
    }

    private String plainText(String fullName, String otp, long expiryMinutes) {
        return "Hi " + fullName + ",\n\n"
                + "Your password reset code is: " + otp + "\n\n"
                + "It expires in " + expiryMinutes + " minutes. If you did not request this, "
                + "you can ignore this email; your password will not change.\n\n"
                + properties.mail().fromName();
    }

    private String html(String fullName, String otp, long expiryMinutes) {
        String name = HtmlUtils.htmlEscape(fullName);
        String brand = HtmlUtils.htmlEscape(properties.mail().fromName());
        return """
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#1f2937">
                  <h2 style="margin:0 0 16px">Reset your password</h2>
                  <p>Hi %s,</p>
                  <p>Use this code to reset your password:</p>
                  <p style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:24px 0">%s</p>
                  <p>It expires in %d minutes.</p>
                  <p style="color:#6b7280;font-size:13px">If you did not request this, you can ignore this
                    email; your password will not change.</p>
                  <p style="color:#6b7280;font-size:13px">%s</p>
                </div>
                """.formatted(name, otp, expiryMinutes, brand);
    }
}
