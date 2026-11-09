package com.example.event_crm.proposal.repository;

import com.example.event_crm.proposal.model.Proposal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProposalRepository extends JpaRepository<Proposal, Long> {

    List<Proposal> findAllByOrderByCreatedAtDesc();

    List<Proposal> findByStatusOrderByCreatedAtDesc(String status);

    long countByStatus(String status);

    Optional<Proposal> findFirstByStatusOrderByCreatedAtDesc(String status);
}