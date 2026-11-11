package com.productionhouse.crm.entity.vendor;

import com.productionhouse.crm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Locale;
import lombok.Getter;
import lombok.Setter;

/** A supplier the production house buys goods or services from. */
@Entity
@Table(name = "vendors")
@Getter
@Setter
public class Vendor extends BaseEntity {

    public static final String CATEGORIES = "Equipment Rental|Camera & Lighting|Sound|Catering|Transport|Costumes"
            + "|Makeup & Hair|Set Construction|Art & Props|VFX|Post Production|Music|Security|Location Services"
            + "|Printing & Publicity|Other";

    @NotBlank(message = "Vendor name is required.")
    @Size(max = 150)
    private String name;

    @Pattern(regexp = CATEGORIES, message = "Choose a valid category.")
    private String category = "Other";

    @NotBlank(message = "Contact person is required.")
    @Size(max = 120)
    private String contactPerson;

    @NotBlank(message = "Email is required.")
    @Email(message = "Enter a valid email address.")
    @Size(max = 254)
    private String email;

    @NotBlank(message = "Phone is required.")
    @Pattern(regexp = "^(\\+91)?[\\s-]*[6-9](?:[\\s-]*\\d){9}$", message = "Enter a valid Indian mobile number.")
    private String phone;

    @Size(max = 100)
    private String city = "";

    @Column(length = 500)
    @Size(max = 500)
    private String address = "";

    @Pattern(regexp = "^$|^\\d{2}[A-Z]{5}\\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$",
            message = "Enter a valid 15-character GSTIN, e.g. 33ABCDE1234F1Z5.")
    private String gstNumber = "";

    @Pattern(regexp = "^$|^[A-Z]{5}\\d{4}[A-Z]$", message = "Enter a valid PAN, e.g. ABCDE1234F.")
    private String panNumber = "";

    @Size(max = 100)
    private String bankName = "";

    @Pattern(regexp = "^$|^\\d{9,18}$", message = "Account number must be 9 to 18 digits.")
    private String accountNumber = "";

    @Pattern(regexp = "^$|^[A-Z]{4}0[A-Z0-9]{6}$", message = "Enter a valid IFSC code, e.g. HDFC0001234.")
    private String ifscCode = "";

    @Pattern(regexp = "Advance|On Delivery|Net 15|Net 30|Net 45|Net 60", message = "Choose valid payment terms.")
    private String paymentTerms = "Net 30";

    /** 1 to 5 stars; empty until the vendor has been rated. */
    @Min(value = 1, message = "Rating must be between 1 and 5.")
    @Max(value = 5, message = "Rating must be between 1 and 5.")
    private Integer rating;

    @Pattern(regexp = "Active|Inactive|Blacklisted", message = "Choose a valid status.")
    private String status = "Active";

    @Column(length = 2000)
    @Size(max = 2000)
    private String notes = "";

    // Tax ids and IFSC codes are upper case; accept them typed in lower case.
    public void setGstNumber(String gstNumber) { this.gstNumber = upper(gstNumber); }
    public void setPanNumber(String panNumber) { this.panNumber = upper(panNumber); }
    public void setIfscCode(String ifscCode) { this.ifscCode = upper(ifscCode); }

    private static String upper(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }
}
