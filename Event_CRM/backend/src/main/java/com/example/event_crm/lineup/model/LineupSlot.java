package com.example.event_crm.lineup.model;

import jakarta.persistence.*;

@Entity
@Table(name = "lineup_slots")
public class LineupSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long eventId;

    @Column(nullable = false)
    private String artistName;

    private String role;
    private String stage;
    private String startTime;
    private String endTime;
    private String soundcheck;
    private Integer greenRoom;
    private String status = "TENTATIVE";
    private long fee;
    private long advancePaid;
    private String managerName;
    private String managerPhone;
    private String managerEmail;

    @Column(length = 1000)
    private String dietaryNotes;

    @Column(length = 1000)
    private String soundRigNotes;

    @Column(length = 1000)
    private String securityNotes;

    private boolean escortRequired;

    public Long getId() { return id; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public String getArtistName() { return artistName; }
    public void setArtistName(String artistName) { this.artistName = artistName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public String getSoundcheck() { return soundcheck; }
    public void setSoundcheck(String soundcheck) { this.soundcheck = soundcheck; }
    public Integer getGreenRoom() { return greenRoom; }
    public void setGreenRoom(Integer greenRoom) { this.greenRoom = greenRoom; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public long getFee() { return fee; }
    public void setFee(long fee) { this.fee = fee; }
    public long getAdvancePaid() { return advancePaid; }
    public void setAdvancePaid(long advancePaid) { this.advancePaid = advancePaid; }
    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }
    public String getManagerPhone() { return managerPhone; }
    public void setManagerPhone(String managerPhone) { this.managerPhone = managerPhone; }
    public String getManagerEmail() { return managerEmail; }
    public void setManagerEmail(String managerEmail) { this.managerEmail = managerEmail; }
    public String getDietaryNotes() { return dietaryNotes; }
    public void setDietaryNotes(String dietaryNotes) { this.dietaryNotes = dietaryNotes; }
    public String getSoundRigNotes() { return soundRigNotes; }
    public void setSoundRigNotes(String soundRigNotes) { this.soundRigNotes = soundRigNotes; }
    public String getSecurityNotes() { return securityNotes; }
    public void setSecurityNotes(String securityNotes) { this.securityNotes = securityNotes; }
    public boolean isEscortRequired() { return escortRequired; }
    public void setEscortRequired(boolean escortRequired) { this.escortRequired = escortRequired; }
}