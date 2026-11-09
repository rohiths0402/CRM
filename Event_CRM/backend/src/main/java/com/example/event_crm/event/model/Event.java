package com.example.event_crm.event.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String category;
    private String ageRating;


    private String status;

    @Column(nullable = false)
    private Long venueId;

    private LocalDate eventDate;
    private LocalTime gatesOpen;
    private LocalTime showStart;
    private LocalTime curfewTime;

    @Column(length = 500)
    private String bannerUrl;

    private long targetBudget;
    private long projectedRevenue;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getAgeRating() { return ageRating; }
    public void setAgeRating(String ageRating) { this.ageRating = ageRating; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public LocalTime getGatesOpen() { return gatesOpen; }
    public void setGatesOpen(LocalTime gatesOpen) { this.gatesOpen = gatesOpen; }
    public LocalTime getShowStart() { return showStart; }
    public void setShowStart(LocalTime showStart) { this.showStart = showStart; }
    public LocalTime getCurfewTime() { return curfewTime; }
    public void setCurfewTime(LocalTime curfewTime) { this.curfewTime = curfewTime; }
    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }
    public long getTargetBudget() { return targetBudget; }
    public void setTargetBudget(long targetBudget) { this.targetBudget = targetBudget; }
    public long getProjectedRevenue() { return projectedRevenue; }
    public void setProjectedRevenue(long projectedRevenue) { this.projectedRevenue = projectedRevenue; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}