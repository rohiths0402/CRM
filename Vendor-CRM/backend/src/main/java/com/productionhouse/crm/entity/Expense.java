package com.productionhouse.crm.entity;

import com.productionhouse.crm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
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
@Table(name = "expenses", indexes = @Index(name = "idx_expense_project", columnList = "projectId"))
@Getter
@Setter
public class Expense extends BaseEntity {

    /** Id of the OttProject this expense is charged to. */
    @NotNull(message = "Project is required.")
    private Long projectId;

    @NotBlank(message = "Title is required.")
    @Size(max = 150)
    private String title;

    @NotBlank(message = "Vendor is required.")
    @Size(max = 150)
    private String vendor;

    @Pattern(regexp = "Location|Equipment|Travel|Food|Accommodation|Salary|Post-production|Other",
            message = "Choose a valid category.")
    private String category = "Location";

    @NotNull(message = "Date is required.")
    private LocalDate date;

    @NotNull(message = "Amount is required.")
    @DecimalMin(value = "0", inclusive = false, message = "Amount must be greater than 0.")
    @Column(precision = 15, scale = 2)
    private BigDecimal amount;

    @Pattern(regexp = "Pending|Paid|Partially Paid", message = "Choose a valid status.")
    private String status = "Pending";
}
