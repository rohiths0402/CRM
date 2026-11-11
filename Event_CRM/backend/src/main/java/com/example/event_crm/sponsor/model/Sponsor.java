package com.example.event_crm.sponsor.model;

import jakarta.persistence.*;

@Entity
@Table(name = "sponsors")
public class Sponsor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long eventId;

    @Column(nullable = false)
    private String brandName;

    private String industry;
    private String tier;
    private long contractValue;
    private long amountReceived;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String contractFileName;
    private Long contractFileSize;

    @Column(columnDefinition = "LONGTEXT")
    private String contractFileUrl;

    public Long getId() { return id; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }
    public long getContractValue() { return contractValue; }
    public void setContractValue(long contractValue) { this.contractValue = contractValue; }
    public long getAmountReceived() { return amountReceived; }
    public void setAmountReceived(long amountReceived) { this.amountReceived = amountReceived; }
    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getContractFileName() { return contractFileName; }
    public void setContractFileName(String contractFileName) { this.contractFileName = contractFileName; }
    public Long getContractFileSize() { return contractFileSize; }
    public void setContractFileSize(Long contractFileSize) { this.contractFileSize = contractFileSize; }
    public String getContractFileUrl() { return contractFileUrl; }
    public void setContractFileUrl(String contractFileUrl) { this.contractFileUrl = contractFileUrl; }
}