package com.productionhouse.crm.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(name = "uk_users_email", columnNames = "email"))
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, length = 150)
    private String company;

    @Column(nullable = false, length = 254)
    private String email;

    @Column(length = 20)
    private String mobile;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    /** ALL, PRODUCTION or VENDOR. Null on accounts created before access levels existed, which means ALL. */
    @Column(length = 20)
    private String access;

    /**
     * The admin whose workspace this login belongs to. Null for an admin (anyone who signed up),
     * whose own id is the workspace id. Every CRM record's ownerId is a workspace id.
     */
    @Column(name = "workspace_owner_id")
    private Long workspaceOwnerId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public String getAccess() { return access == null ? ACCESS_ALL : access; }
    public void setAccess(String access) { this.access = access; }
    public Long getWorkspaceOwnerId() { return workspaceOwnerId; }
    public void setWorkspaceOwnerId(Long workspaceOwnerId) { this.workspaceOwnerId = workspaceOwnerId; }

    public static final String ACCESS_ALL = "ALL";
    public static final String ACCESS_PRODUCTION = "PRODUCTION";
    public static final String ACCESS_VENDOR = "VENDOR";

    /** The id that owns this login's records: its admin's id, or its own if it is the admin. */
    public Long getWorkspaceId() { return workspaceOwnerId == null ? id : workspaceOwnerId; }

    public boolean isAdmin() { return workspaceOwnerId == null; }

    public boolean canUseProduction() { return !ACCESS_VENDOR.equals(getAccess()); }

    public boolean canUseVendor() { return !ACCESS_PRODUCTION.equals(getAccess()); }
}
