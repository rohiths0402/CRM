package com.productionhouse.crm.entity;

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

@Entity
@Table(name = "contracts")
@Getter
@Setter
public class Contract extends BaseEntity {

    @NotBlank(message = "Title is required.")
    @Size(max = 150)
    private String title;

    @Pattern(regexp = "Artist|Director|Producer|Vendor|OTT Platform", message = "Choose a valid contract type.")
    private String type = "Artist";

    @NotBlank(message = "Party is required.")
    @Size(max = 150)
    private String party;

    /** Project name. */
    @NotBlank(message = "Project is required.")
    @Size(max = 150)
    private String project;

    @NotNull(message = "Start date is required.")
    private LocalDate startDate;

    @NotNull(message = "End date is required.")
    private LocalDate endDate;

    @NotNull(message = "Contract value is required.")
    @DecimalMin(value = "0", message = "Contract value cannot be negative.")
    // "value" is an SQL keyword, so the column gets a safer name.
    @Column(name = "contract_value", precision = 15, scale = 2)
    private BigDecimal value;

    @Size(max = 300)
    private String paymentTerms = "";

    @Pattern(regexp = "Draft|Active|Expired|Terminated", message = "Choose a valid status.")
    private String status = "Draft";

    /** File name only; the UI does not upload the file itself yet. */
    @Size(max = 255)
    private String document = "";

    /** Display code like "CON-007", which the UI shows and searches as the contract id. */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public String getContractCode() {
        return getId() == null ? null : "CON-%03d".formatted(getId());
    }

    @JsonIgnore
    @AssertTrue(message = "End date cannot be before start date.")
    public boolean isDateRangeValid() {
        return startDate == null || endDate == null || !endDate.isBefore(startDate);
    }
}
