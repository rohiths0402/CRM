package com.productionhouse.crm.entity;

import com.productionhouse.crm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "shooting_locations")
@Getter
@Setter
public class ShootingLocation extends BaseEntity {

    @NotBlank(message = "Location name is required.")
    @Size(max = 150)
    private String name;

    @Pattern(regexp = "Studio|Outdoor|Indoor|Set|Private Property|Public Location", message = "Choose a valid type.")
    private String type = "Studio";

    @NotBlank(message = "Address is required.")
    @Size(max = 300)
    private String address;

    @NotBlank(message = "City is required.")
    @Size(max = 100)
    private String city;

    @NotBlank(message = "State is required.")
    @Size(max = 100)
    private String state;

    @Pattern(regexp = "^$|^https?://.+", flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "Map URL must start with http:// or https://.")
    @Size(max = 1000)
    @Column(length = 1000)
    private String mapUrl = "";

    @NotNull(message = "Rental cost is required.")
    @DecimalMin(value = "0", message = "Rental cost cannot be negative.")
    @Column(precision = 15, scale = 2)
    private BigDecimal rentalCost;

    /** Project name, or "Not Assigned". */
    @Size(max = 150)
    private String project = "Not Assigned";

    @NotBlank(message = "Contact person is required.")
    @Size(max = 120)
    private String contactPerson;

    @NotBlank(message = "Contact phone is required.")
    @Size(max = 20)
    private String contactPhone;

    @Pattern(regexp = "Pending|Approved|Rejected", message = "Choose a valid status.")
    private String status = "Pending";

    @Column(length = 2000)
    @Size(max = 2000)
    private String description = "";
}
