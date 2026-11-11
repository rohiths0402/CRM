package com.productionhouse.crm.entity;

import com.productionhouse.crm.common.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "cast_crew_members")
@Getter
@Setter
public class CastCrewMember extends BaseEntity {

    @NotBlank(message = "Name is required.")
    @Size(max = 120)
    private String name;

    @Pattern(regexp = "Actor|Director|Cinematographer|Editor|Producer|Technician|Writer",
            message = "Choose a valid role.")
    private String role = "Actor";

    @NotBlank(message = "Email is required.")
    @Email(message = "Enter a valid email address.")
    @Size(max = 254)
    private String email;

    // Same rule as the UI: optional +91, then a 10-digit Indian mobile; spaces and dashes allowed.
    @NotBlank(message = "Phone is required.")
    @Pattern(regexp = "^(\\+91)?[\\s-]*[6-9](?:[\\s-]*\\d){9}$", message = "Enter a valid Indian mobile number.")
    private String phone;

    /** Free text such as "8 Years", as the UI collects it. */
    @NotBlank(message = "Experience is required.")
    @Size(max = 50)
    private String experience;

    @NotBlank(message = "Location is required.")
    @Size(max = 120)
    private String location;

    @Pattern(regexp = "Available|On Project|Unavailable", message = "Choose a valid status.")
    private String status = "Available";

    /** Project name, or "None". */
    @Size(max = 150)
    private String project = "None";
}
