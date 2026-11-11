package com.productionhouse.crm.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

/** A Team Coordination task. */
@Entity
@Table(name = "tasks")
@Getter
@Setter
public class CoordinationTask extends BaseEntity {

    @NotBlank(message = "Title is required.")
    @Size(max = 150)
    private String title;

    @Column(length = 2000)
    @Size(max = 2000)
    private String description = "";

    /** Project name. */
    @NotBlank(message = "Project is required.")
    @Size(max = 150)
    private String project;

    /** TeamMember name, as the UI links them. */
    @NotBlank(message = "Assignee is required.")
    @Size(max = 120)
    private String assignee;

    @Pattern(regexp = TeamMember.DEPARTMENTS, message = "Choose a valid department.")
    private String department = "Production";

    @Pattern(regexp = "Low|Medium|High|Urgent", message = "Choose a valid priority.")
    private String priority = "Medium";

    @Pattern(regexp = "To Do|In Progress|Completed|On Hold", message = "Choose a valid status.")
    private String status = "To Do";

    @NotNull(message = "Start date is required.")
    private LocalDate startDate;

    @NotNull(message = "Due date is required.")
    private LocalDate dueDate;

    @JsonIgnore
    @AssertTrue(message = "Due date cannot be before start date.")
    public boolean isDateRangeValid() {
        return startDate == null || dueDate == null || !dueDate.isBefore(startDate);
    }
}
