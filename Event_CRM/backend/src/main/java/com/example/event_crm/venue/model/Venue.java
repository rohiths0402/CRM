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
    private String state;

    @Column(length = 500)
    private String address;

    private Double latitude;
    private Double longitude;

    private int capacity;
    private int parkingCapacity;
    private long baseRentalCost;

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public int getParkingCapacity() { return parkingCapacity; }
    public void setParkingCapacity(int parkingCapacity) { this.parkingCapacity = parkingCapacity; }
    public long getBaseRentalCost() { return baseRentalCost; }
    public void setBaseRentalCost(long baseRentalCost) { this.baseRentalCost = baseRentalCost; }
}