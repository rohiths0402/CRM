package com.productionhouse.crm.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

@Entity
@Table(name = "payments")
@Getter
@Setter
public class Payment extends BaseEntity {

    @NotBlank(message = "Title is required.")
    @Size(max = 150)
    private String title;

    @NotBlank(message = "Party is required.")
    @Size(max = 150)
    private String party;

    /** Project name. */
    @NotBlank(message = "Project is required.")
    @Size(max = 150)
    private String project;

    @Pattern(regexp = "Outgoing|Incoming", message = "Direction must be Outgoing or Incoming.")
    private String direction = "Outgoing";

    @Pattern(regexp = "Production Expense|Artist Payment|Crew Salary|Vendor Payment|OTT Revenue|Sponsorship|Other",
            message = "Choose a valid payment type.")
    private String type = "Production Expense";

    @NotNull(message = "Amount is required.")
    @DecimalMin(value = "0", inclusive = false, message = "Amount must be greater than 0.")
    @Column(precision = 15, scale = 2)
    private BigDecimal amount;

    /** Empty until the payment is made. */
    private LocalDate paymentDate;

    @NotNull(message = "Due date is required.")
    private LocalDate dueDate;

    @Pattern(regexp = "Bank Transfer|UPI|Cash|Cheque|Other", message = "Choose a valid payment method.")
    private String method = "Bank Transfer";

    @Size(max = 100)
    private String reference = "";

    @Pattern(regexp = "Pending|Completed|Overdue|Cancelled", message = "Choose a valid status.")
    private String status = "Pending";

    @Column(length = 2000)
    @Size(max = 2000)
    private String notes = "";

    @JsonIgnore
    @AssertTrue(message = "Payment date is required for a completed payment.")
    public boolean isPaymentDateValid() {
        return !"Completed".equals(status) || paymentDate != null;
    }
}
