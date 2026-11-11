package com.productionhouse.crm.entity.vendor;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.productionhouse.crm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/** A bill received from a vendor. paidAmount is kept in step with its completed vendor payments. */
@Entity
@Table(name = "vendor_invoices")
@Getter
@Setter
public class VendorInvoice extends BaseEntity {

    public static final String[] SERVER_FIELDS = {"paidAmount"};

    @NotNull(message = "Vendor is required.")
    private Long vendorId;

    private Long purchaseOrderId;

    /** The vendor's own invoice number. */
    @NotBlank(message = "Invoice number is required.")
    @Size(max = 60)
    private String invoiceNumber;

    @NotNull(message = "Invoice date is required.")
    private LocalDate invoiceDate;

    @NotNull(message = "Due date is required.")
    private LocalDate dueDate;

    @NotNull(message = "Amount is required.")
    @DecimalMin(value = "0", inclusive = false, message = "Amount must be greater than 0.")
    @Column(precision = 15, scale = 2)
    private BigDecimal amount;

    @DecimalMin(value = "0", message = "Tax amount cannot be negative.")
    @Column(precision = 15, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    /** Pending and Approved are set by people; Partially Paid and Paid follow from payments. */
    @Pattern(regexp = "Pending|Approved|Partially Paid|Paid|Disputed|Cancelled", message = "Choose a valid status.")
    private String status = "Pending";

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(length = 2000)
    @Size(max = 2000)
    private String notes = "";

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public BigDecimal getTotalAmount() {
        return amount == null ? null : amount.add(taxAmount == null ? BigDecimal.ZERO : taxAmount);
    }

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public BigDecimal getBalance() {
        BigDecimal total = getTotalAmount();
        return total == null ? null : total.subtract(paidAmount);
    }

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public boolean isOverdue() {
        BigDecimal balance = getBalance();
        return dueDate != null && dueDate.isBefore(LocalDate.now()) && !"Cancelled".equals(status)
                && balance != null && balance.signum() > 0;
    }

    @JsonIgnore
    @AssertTrue(message = "Due date cannot be before the invoice date.")
    public boolean isDueDateValid() {
        return dueDate == null || invoiceDate == null || !dueDate.isBefore(invoiceDate);
    }
}
