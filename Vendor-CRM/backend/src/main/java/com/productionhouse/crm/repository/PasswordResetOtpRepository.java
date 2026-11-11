package com.productionhouse.crm.repository;

import com.productionhouse.crm.entity.PasswordResetOtp;
import com.productionhouse.crm.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {

    Optional<PasswordResetOtp> findFirstByUserAndUsedFalseOrderByCreatedAtDesc(User user);

    Optional<PasswordResetOtp> findFirstByUserOrderByCreatedAtDesc(User user);

    @Modifying
    @Query("update PasswordResetOtp o set o.used = true where o.user = :user and o.used = false")
    int invalidateAllForUser(User user);

    @Modifying
    @Query("delete from PasswordResetOtp o where o.user = :user")
    int deleteAllForUser(User user);
}
