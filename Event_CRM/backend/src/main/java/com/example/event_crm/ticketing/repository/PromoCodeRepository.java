package com.example.event_crm.ticketing.repository;

import com.example.event_crm.ticketing.model.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromoCodeRepository extends JpaRepository<PromoCode, Long> {

    boolean existsByCode(String code);
}