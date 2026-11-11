package com.productionhouse.crm.common;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.Instant;

/**
 * Common columns for every CRM record. Each record belongs to a workspace (ownerId is the
 * workspace admin's user id), and the API only ever shows a user their own workspace's records.
 * id and the timestamps are read-only: values sent by the client are ignored.
 */
@MappedSuperclass
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @JsonIgnore
    @Column(name = "owner_id", nullable = false, updatable = false)
    private Long ownerId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
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
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
