package com.example.event_crm.venue.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "venues")
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String type;
    private String city;
    private String stateSlug;

    @Column(length = 500)
    private String address;

    private Double latitude;
    private Double longitude;

    private int capacity;
    private int parkingCapacity;
    private long baseRentalCost;
    private int greenRooms;
    private boolean powerBackup;
    private boolean wheelchairAccess;
    private LocalDate fireNocValidTill;
    private String contactName;
    private String contactPhone;

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getStateSlug() { return stateSlug; }
    public void setStateSlug(String stateSlug) { this.stateSlug = stateSlug; }
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
    public int getGreenRooms() { return greenRooms; }
    public void setGreenRooms(int greenRooms) { this.greenRooms = greenRooms; }
    public boolean isPowerBackup() { return powerBackup; }
    public void setPowerBackup(boolean powerBackup) { this.powerBackup = powerBackup; }
    public boolean isWheelchairAccess() { return wheelchairAccess; }
    public void setWheelchairAccess(boolean wheelchairAccess) { this.wheelchairAccess = wheelchairAccess; }
    public LocalDate getFireNocValidTill() { return fireNocValidTill; }
    public void setFireNocValidTill(LocalDate fireNocValidTill) { this.fireNocValidTill = fireNocValidTill; }
    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
}