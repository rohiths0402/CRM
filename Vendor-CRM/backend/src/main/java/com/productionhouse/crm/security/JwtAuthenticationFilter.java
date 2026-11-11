package com.productionhouse.crm.security;

import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String PRODUCTION = "PRODUCTION";
    public static final String VENDOR = "VENDOR";
    public static final String ADMIN = "ADMIN";

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (header != null && header.startsWith(BEARER_PREFIX)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            jwtService.parseUserId(header.substring(BEARER_PREFIX.length()))
                    .flatMap(userRepository::findById)
                    .ifPresent(user -> SecurityContextHolder.getContext().setAuthentication(
                            new UsernamePasswordAuthenticationToken(user, null, authorities(user))));
        }

        chain.doFilter(request, response);
    }

    /** Read on every request, so access changes apply without signing in again. */
    private static List<SimpleGrantedAuthority> authorities(User user) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        if (user.canUseProduction()) authorities.add(new SimpleGrantedAuthority(PRODUCTION));
        if (user.canUseVendor()) authorities.add(new SimpleGrantedAuthority(VENDOR));
        if (user.isAdmin()) authorities.add(new SimpleGrantedAuthority(ADMIN));
        return authorities;
    }
}
