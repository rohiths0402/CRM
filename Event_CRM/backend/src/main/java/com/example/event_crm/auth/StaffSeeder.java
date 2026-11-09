package com.example.event_crm.auth;

import com.example.event_crm.user.model.AppUser;
import com.example.event_crm.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class StaffSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final PasswordEncoder encoder;

    @Value("${app.seed.password}")
    private String password;

    public StaffSeeder(UserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (users.count() > 0) {
            return;
        }
        add("Arjun Menon", "superadmin@loop.local", "SUPER_ADMIN", "Event Director", "LOOP-SAD-001", "Control Room");
        add("Divya Raman", "admin@loop.local", "ADMIN", "Operations Manager", "LOOP-ADM-402", "Main Stage Bay 1");
        add("Imran Khan", "employee@loop.local", "EMPLOYEE", "Gate Marshal", "LOOP-EMP-118", "Gate 4 Turnstile");
        System.out.println("Staff created: superadmin, admin and employee");
    }

    private void add(String name, String email, String role, String designation, String employeeId, String shift) {
        AppUser user = new AppUser();
        user.setName(name);
        user.setEmail(email);
        user.setRole(role);
        user.setDesignation(designation);
        user.setEmployeeId(employeeId);
        user.setShift(shift);
        user.setPasswordHash(encoder.encode(password));
        users.save(user);
    }
}