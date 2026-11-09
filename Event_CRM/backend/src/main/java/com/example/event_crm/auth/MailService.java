package com.example.event_crm.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MailService {

    private final JavaMailSender sender;

    @Value("${spring.mail.username:}")
    private String from;

    public MailService(JavaMailSender sender) {
        this.sender = sender;
    }

    public void sendCode(String to, String name, String code) {
        if (from.isBlank()) {
            System.out.println("Email code for " + to + ": " + code);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("LOOP Event CRM password reset code");
        message.setText("Hi " + name + ",\n\nYour password reset code is " + code
                + ". It is valid for 10 minutes.\n\nIf you did not ask for this, ignore this email.");
        try {
            sender.send(message);
        } catch (MailException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not send the email. Try again.");
        }
    }
}