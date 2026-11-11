package com.productionhouse.crm.security;

import com.productionhouse.crm.config.AppProperties;
import com.productionhouse.crm.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey key;
    private final Duration defaultTtl;
    private final Duration rememberMeTtl;

    public JwtService(AppProperties properties) {
        byte[] secret = properties.jwt().secret().getBytes(StandardCharsets.UTF_8);
        if (secret.length < 32) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 characters (256 bits).");
        }
        this.key = Keys.hmacShaKeyFor(secret);
        this.defaultTtl = Duration.ofMinutes(properties.jwt().expirationMinutes());
        this.rememberMeTtl = Duration.ofDays(properties.jwt().rememberMeExpirationDays());
    }

    public Duration ttl(boolean rememberMe) {
        return rememberMe ? rememberMeTtl : defaultTtl;
    }

    public String generateToken(User user, boolean rememberMe) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl(rememberMe))))
                .signWith(key)
                .compact();
    }

    /** Returns the user id from a valid, unexpired token, or empty for anything else. */
    public Optional<Long> parseUserId(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
            return Optional.of(Long.valueOf(claims.getSubject()));
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }
}
