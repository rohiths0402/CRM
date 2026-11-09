package com.example.event_crm.auth;

import com.example.event_crm.user.model.AppUser;
import com.example.event_crm.user.repository.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository users;

    public AppUserDetailsService(UserRepository users) {
        this.users = users;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AppUser user = users.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));
        return User.withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole())
                .disabled(!user.isActive())
                .accountLocked(user.isLocked())
                .build();
    }
}