package com.example.event_crm.venue.model;

import jakarta.persistence.*;

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

    private int capacity;
    private int soldCount;
    private boolean fireExitVerified;

    public Long getId() { return id; }
    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public int getSoldCount() { return soldCount; }
    public void setSoldCount(int soldCount) { this.soldCount = soldCount; }
    public boolean isFireExitVerified() { return fireExitVerified; }
    public void setFireExitVerified(boolean fireExitVerified) { this.fireExitVerified = fireExitVerified; }
}