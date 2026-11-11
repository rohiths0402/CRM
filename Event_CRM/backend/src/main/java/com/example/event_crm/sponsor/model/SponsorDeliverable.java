package com.example.event_crm.sponsor.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "sponsor_deliverables")
public class SponsorDeliverable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long sponsorId;

    @Column(nullable = false, length = 300)
    private String text;

    private LocalDate dueDate;
    private String status = "PENDING";

    public Long getId() { return id; }
    public Long getSponsorId() { return sponsorId; }
    public void setSponsorId(Long sponsorId) { this.sponsorId = sponsorId; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}