package com.example.event_crm.venue.model;

import jakarta.persistence.*;

@Entity
@Table(name = "venues")
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String city;

    @Column(length = 500)
    private String address;

    private int capacity;
    private int parkingCapacity;
    private long baseRentalCost;

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public int getParkingCapacity() { return parkingCapacity; }
    public void setParkingCapacity(int parkingCapacity) { this.parkingCapacity = parkingCapacity; }
    public long getBaseRentalCost() { return baseRentalCost; }
    public void setBaseRentalCost(long baseRentalCost) { this.baseRentalCost = baseRentalCost; }
}