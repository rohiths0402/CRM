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
@Table(name = "team_members")
@Getter
@Setter
public class TeamMember extends BaseEntity {

    public static final String DEPARTMENTS =
            "Production|Direction|Camera|Costume|Art|Sound|Lighting|Post Production|Marketing";

    @NotBlank(message = "Name is required.")
    @Size(max = 120)
    private String name;

    @NotBlank(message = "Role is required.")
    @Size(max = 100)
    private String role;

    @Pattern(regexp = DEPARTMENTS, message = "Choose a valid department.")
    private String department = "Production";

    @NotBlank(message = "Email is required.")
    @Email(message = "Enter a valid email address.")
    @Size(max = 254)
    private String email;

    @Size(max = 20)
    private String phone = "";
}
