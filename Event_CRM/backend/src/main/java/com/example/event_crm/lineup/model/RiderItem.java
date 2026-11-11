package com.example.event_crm.lineup.model;

import jakarta.persistence.*;

@Entity
@Table(name = "rider_items")
public class RiderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long slotId;

    @Column(nullable = false)
    private String label;

    private String category;
    private String status = "PENDING";

    public Long getId() { return id; }
    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}