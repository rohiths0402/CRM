package com.example.event_crm.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordOtpRepository extends JpaRepository<PasswordOtp, Long> {

    Optional<PasswordOtp> findFirstByIdentifierOrderByIdDesc(String identifier);

    void deleteByIdentifier(String identifier);
}