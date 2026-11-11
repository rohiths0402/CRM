package com.productionhouse.crm.repository.vendor;

import com.productionhouse.crm.common.OwnedRepository;
import com.productionhouse.crm.entity.vendor.Quotation;

public interface QuotationRepository extends OwnedRepository<Quotation> {

    boolean existsByOwnerIdAndVendorId(Long ownerId, Long vendorId);
}
