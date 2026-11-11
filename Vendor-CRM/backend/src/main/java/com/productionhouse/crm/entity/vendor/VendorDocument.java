package com.productionhouse.crm.entity.vendor;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.productionhouse.crm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/** A compliance or agreement document held for a vendor, with an optional expiry date. */
@Entity
@Table(name = "vendor_documents")
@Getter
@Setter
public class VendorDocument extends BaseEntity {

    /** Documents expiring within this many days are flagged "Expiring Soon". */
    public static final int EXPIRY_WARNING_DAYS = 30;

    @NotNull(message = "Vendor is required.")
    private Long vendorId;

    @Pattern(regexp = "GST Certificate|PAN Card|Agreement|Insurance|NDA|Bank Details|Trade License|Other",
            message = "Choose a valid document type.")
    private String type = "Other";

    @NotBlank(message = "Title is required.")
    @Size(max = 150)
    private String title;

    @Size(max = 100)
    private String documentNumber = "";

    private LocalDate issueDate;

    private LocalDate expiryDate;

    /** File name or link; files are stored outside the CRM, as for contracts. */
    @Size(max = 500)
    @Column(length = 500)
    private String fileName = "";

    @Column(length = 2000)
    @Size(max = 2000)
    private String notes = "";

    /** No Expiry, Valid, Expiring Soon or Expired. */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public String getExpiryStatus() {
        if (expiryDate == null) {
            return "No Expiry";
        }
        LocalDate today = LocalDate.now();
        if (expiryDate.isBefore(today)) {
            return "Expired";
        }
        return expiryDate.isAfter(today.plusDays(EXPIRY_WARNING_DAYS)) ? "Valid" : "Expiring Soon";
    }

    @JsonIgnore
    @AssertTrue(message = "Expiry date cannot be before the issue date.")
    public boolean isExpiryDateValid() {
        return expiryDate == null || issueDate == null || !expiryDate.isBefore(issueDate);
    }
}
