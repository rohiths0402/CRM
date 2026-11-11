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

/** An OTT project. Its budget is also what the Budgets & Expenses page tracks spending against. */
@Entity
@Table(name = "ott_projects")
@Getter
@Setter
public class OttProject extends BaseEntity {

    @NotBlank(message = "Project name is required.")
    @Size(min = 2, max = 150, message = "Project name must be 2 to 150 characters.")
    private String projectName;

    @Pattern(regexp = "Netflix|Amazon Prime Video|Disney\\+ Hotstar|ZEE5|Sony LIV|Other",
            message = "Choose a valid platform.")
    private String platform = "Netflix";

    @Pattern(regexp = "Movie|Web Series|Documentary|Short Film|Reality Show",
            message = "Choose a valid project type.")
    private String projectType = "Movie";

    @NotBlank(message = "Genre is required.")
    @Size(max = 60)
    private String genre;

    @Pattern(regexp = "Tamil|Telugu|Malayalam|Kannada|Hindi|English|Other", message = "Choose a valid language.")
    private String language = "Tamil";

    @NotNull(message = "Start date is required.")
    private LocalDate startDate;

    @NotNull(message = "End date is required.")
    private LocalDate endDate;

    @NotNull(message = "Budget is required.")
    @DecimalMin(value = "0", inclusive = false, message = "Budget must be greater than 0.")
    @Column(precision = 15, scale = 2)
    private BigDecimal budget;

    @NotBlank(message = "Project manager is required.")
    @Size(max = 120)
    private String projectManager;

    @Pattern(regexp = "Planning|In Progress|Completed|On Hold", message = "Choose a valid status.")
    private String status = "Planning";

    @Column(length = 2000)
    @Size(max = 2000)
    private String description = "";

    @JsonIgnore
    @AssertTrue(message = "End date cannot be before start date.")
    public boolean isDateRangeValid() {
        return startDate == null || endDate == null || !endDate.isBefore(startDate);
    }
}
