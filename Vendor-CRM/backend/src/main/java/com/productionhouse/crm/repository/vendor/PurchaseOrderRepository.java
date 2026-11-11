package com.productionhouse.crm.repository.vendor;

import com.productionhouse.crm.common.OwnedRepository;
import com.productionhouse.crm.entity.vendor.PurchaseOrder;

public interface PurchaseOrderRepository extends OwnedRepository<PurchaseOrder> {

    boolean existsByOwnerIdAndVendorId(Long ownerId, Long vendorId);

    boolean existsByOwnerIdAndQuotationId(Long ownerId, Long quotationId);
}
