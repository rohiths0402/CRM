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

@Entity
@Table(name = "vendor_purchase_orders")
@Getter
@Setter
public class PurchaseOrder extends BaseEntity {

    @NotNull(message = "Vendor is required.")
    private Long vendorId;

    /** The accepted quotation this order came from, if any. */
    private Long quotationId;

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

    @NotNull(message = "Order date is required.")
    private LocalDate orderDate;

    private LocalDate deliveryDate;

    @NotNull(message = "Amount is required.")
    @DecimalMin(value = "0", inclusive = false, message = "Amount must be greater than 0.")
    @Column(precision = 15, scale = 2)
    private BigDecimal amount;

    @DecimalMin(value = "0", message = "Tax must be between 0 and 100%.")
    @DecimalMax(value = "100", message = "Tax must be between 0 and 100%.")
    @Column(precision = 5, scale = 2)
    private BigDecimal taxPercent = new BigDecimal("18");

    @Pattern(regexp = "Draft|Issued|Delivered|Closed|Cancelled", message = "Choose a valid status.")
    private String status = "Draft";

    @Column(length = 2000)
    @Size(max = 2000)
    private String notes = "";

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public String getPoNumber() {
        return getId() == null ? null : "PO-%03d".formatted(getId());
    }

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public BigDecimal getTotalAmount() {
        return VendorMoney.withTax(amount, taxPercent);
    }

    @JsonIgnore
    @AssertTrue(message = "Delivery date cannot be before the order date.")
    public boolean isDeliveryDateValid() {
        return deliveryDate == null || orderDate == null || !deliveryDate.isBefore(orderDate);
    }
}
