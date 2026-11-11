package com.example.event_crm.sponsor.repository;

import com.example.event_crm.sponsor.model.SponsorDeliverable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SponsorDeliverableRepository extends JpaRepository<SponsorDeliverable, Long> {

    List<SponsorDeliverable> findBySponsorIdOrderByDueDateAsc(Long sponsorId);

    void deleteBySponsorId(Long sponsorId);
}