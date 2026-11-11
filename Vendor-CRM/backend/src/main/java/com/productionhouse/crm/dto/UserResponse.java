package com.productionhouse.crm.dto;

import com.productionhouse.crm.entity.User;
import java.time.Instant;

/** access is ALL, PRODUCTION or VENDOR; admin is true for the account that signed up and can add users. */
public record UserResponse(Long id, String fullName, String company, String email, String mobile,
                           String access, boolean admin, Instant createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getCompany(),
                user.getEmail(), user.getMobile(), user.getAccess(), user.isAdmin(), user.getCreatedAt());
    }
}
