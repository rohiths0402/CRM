package com.productionhouse.crm.entity.vendor;

import com.productionhouse.crm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/** Money paid, or scheduled to be paid, to a vendor. Completed payments count against their invoice. */
@Entity
@Table(name = "vendor_payments")
@Getter
@Setter
public class VendorPayment extends BaseEntity {

    @NotNull(message = "Vendor is required.")
    private Long vendorId;

    private Long invoiceId;

    @NotNull(message = "Amount is required.")
    @DecimalMin(value = "0", inclusive = false, message = "Amount must be greater than 0.")
    @Column(precision = 15, scale = 2)
    private BigDecimal amount;

    /** The date it was paid, or is scheduled for. */
    @NotNull(message = "Payment date is required.")
    private LocalDate paymentDate;

    @Pattern(regexp = "Bank Transfer|UPI|Cheque|Cash|Other", message = "Choose a valid payment method.")
    private String method = "Bank Transfer";

    @Size(max = 100)
    private String reference = "";

    @Pattern(regexp = "Scheduled|Completed|Failed|Cancelled", message = "Choose a valid status.")
    private String status = "Completed";

    @Column(length = 2000)
    @Size(max = 2000)
    private String notes = "";
}
