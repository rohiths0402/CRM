package com.productionhouse.crm.entity.vendor;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.productionhouse.crm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/** A price requested from, then quoted by, a vendor. Accepting one is the usual step before a purchase order. */
@Entity
@Table(name = "vendor_quotations")
@Getter
@Setter
public class Quotation extends BaseEntity {

    @NotNull(message = "Vendor is required.")
    private Long vendorId;

    /** OTT project name, as in the production modules. */
    @NotBlank(message = "Project is required.")
    @Size(max = 150)
    private String project;

    @NotBlank(message = "Title is required.")
    @Size(max = 150)
    private String title;

    @Column(length = 2000)
    @Size(max = 2000)
    private String description = "";

    @NotNull(message = "Request date is required.")
    private LocalDate requestDate;

    private LocalDate validUntil;

    /** Empty while the quote is still Requested. */
    @DecimalMin(value = "0", inclusive = false, message = "Amount must be greater than 0.")
    @Column(precision = 15, scale = 2)
    private BigDecimal amount;

    @DecimalMin(value = "0", message = "Tax must be between 0 and 100%.")
    @DecimalMax(value = "100", message = "Tax must be between 0 and 100%.")
    @Column(precision = 5, scale = 2)
    private BigDecimal taxPercent = new BigDecimal("18");

    @Pattern(regexp = "Requested|Received|Accepted|Rejected", message = "Choose a valid status.")
    private String status = "Requested";

    @Column(length = 2000)
    @Size(max = 2000)
    private String notes = "";

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public String getQuoteCode() {
        return getId() == null ? null : "QT-%03d".formatted(getId());
    }

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public BigDecimal getTotalAmount() {
        return VendorMoney.withTax(amount, taxPercent);
    }

    @JsonIgnore
    @AssertTrue(message = "Amount is required once the quote is received.")
    public boolean isAmountValid() {
        return "Requested".equals(status) || amount != null;
    }

    @JsonIgnore
    @AssertTrue(message = "Valid-until date cannot be before the request date.")
    public boolean isValidityValid() {
        return validUntil == null || requestDate == null || !validUntil.isBefore(requestDate);
    }
}
