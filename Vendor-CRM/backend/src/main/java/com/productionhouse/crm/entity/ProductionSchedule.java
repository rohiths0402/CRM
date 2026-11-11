package com.productionhouse.crm.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
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
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "production_schedules")
@Getter
@Setter
public class ProductionSchedule extends BaseEntity {

    @NotBlank(message = "Title is required.")
    @Size(max = 150)
    private String title;

    /** Project name. */
    @NotBlank(message = "Project is required.")
    @Size(max = 150)
    private String project;

    @NotNull(message = "Date is required.")
    private LocalDate date;

    @NotNull(message = "Start time is required.")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @NotNull(message = "End time is required.")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    /** True when the shoot runs past midnight, so endTime is on the next day. */
    private boolean endsNextDay;

    @NotBlank(message = "Location is required.")
    @Size(max = 200)
    private String location;

    /** Comma-separated names, as the UI collects them. */
    @Column(length = 1000)
    @Size(max = 1000)
    private String crew = "";

    @Pattern(regexp = "Planned|Confirmed|Completed|Cancelled", message = "Choose a valid status.")
    private String status = "Planned";

    @Column(length = 2000)
    @Size(max = 2000)
    private String description = "";

    @JsonIgnore
    @AssertTrue(message = "End time must be after start time, unless the shoot ends the next day.")
    public boolean isTimeRangeValid() {
        if (startTime == null || endTime == null) return true;
        if (startTime.equals(endTime)) return false;
        return endsNextDay ? endTime.isBefore(startTime) : endTime.isAfter(startTime);
    }
}
