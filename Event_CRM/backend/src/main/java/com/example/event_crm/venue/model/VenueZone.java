package com.example.event_crm.venue.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "venue_zones")
public class VenueZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long venueId;

    @Column(nullable = false)
    private String name;

    private String kind;
    private int capacity;
    private int soldCount;
    private int fireExits;
    private String safetyStatus;
    private LocalDate lastInspection;

    public Long getId() { return id; }
    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public int getSoldCount() { return soldCount; }
    public void setSoldCount(int soldCount) { this.soldCount = soldCount; }
    public int getFireExits() { return fireExits; }
    public void setFireExits(int fireExits) { this.fireExits = fireExits; }
    public String getSafetyStatus() { return safetyStatus; }
    public void setSafetyStatus(String safetyStatus) { this.safetyStatus = safetyStatus; }
    public LocalDate getLastInspection() { return lastInspection; }
    public void setLastInspection(LocalDate lastInspection) { this.lastInspection = lastInspection; }
}