package com.productionhouse.crm.entity.vendor;

import java.math.BigDecimal;
import java.math.RoundingMode;

final class VendorMoney {

    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private VendorMoney() {
    }

    /** amount plus taxPercent of it, rounded to paise; null when there is no amount yet. */
    static BigDecimal withTax(BigDecimal amount, BigDecimal taxPercent) {
        if (amount == null) {
            return null;
        }
        BigDecimal tax = taxPercent == null ? BigDecimal.ZERO : amount.multiply(taxPercent).divide(HUNDRED);
        return amount.add(tax).setScale(2, RoundingMode.HALF_UP);
    }
}
