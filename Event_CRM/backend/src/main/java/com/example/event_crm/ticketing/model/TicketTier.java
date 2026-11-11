package com.example.event_crm.ticketing.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ticket_tiers")
public class TicketTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long eventId;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String perks;

    private long price;
    private int taxPercentage;
    private int quota;
    private int sold;
    private int maxPerOrder;
    private String status = "PAUSED";

    public Long getId() { return id; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPerks() { return perks; }
    public void setPerks(String perks) { this.perks = perks; }
    public long getPrice() { return price; }
    public void setPrice(long price) { this.price = price; }
    public int getTaxPercentage() { return taxPercentage; }
    public void setTaxPercentage(int taxPercentage) { this.taxPercentage = taxPercentage; }
    public int getQuota() { return quota; }
    public void setQuota(int quota) { this.quota = quota; }
    public int getSold() { return sold; }
    public void setSold(int sold) { this.sold = sold; }
    public int getMaxPerOrder() { return maxPerOrder; }
    public void setMaxPerOrder(int maxPerOrder) { this.maxPerOrder = maxPerOrder; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}