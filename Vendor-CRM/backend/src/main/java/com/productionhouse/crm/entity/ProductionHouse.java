package com.productionhouse.crm.entity;

import com.productionhouse.crm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "production_houses")
@Getter
@Setter
public class ProductionHouse extends BaseEntity {

    @NotBlank(message = "Company name is required.")
    @Size(max = 150)
    private String companyName;

    @NotBlank(message = "Contact person is required.")
    @Size(max = 120)
    private String contactPerson;

    @NotBlank(message = "Email is required.")
    @Email(message = "Enter a valid email address.")
    @Size(max = 254)
    private String email;

    @NotBlank(message = "Phone is required.")
    @Size(max = 20)
    private String phone;

    @NotBlank(message = "Location is required.")
    @Size(max = 200)
    private String location;

    @Size(max = 255)
    private String website = "";

    @Pattern(regexp = "Active|Inactive", message = "Status must be Active or Inactive.")
    private String status = "Active";

    @Column(length = 2000)
    @Size(max = 2000)
    private String description = "";
}
