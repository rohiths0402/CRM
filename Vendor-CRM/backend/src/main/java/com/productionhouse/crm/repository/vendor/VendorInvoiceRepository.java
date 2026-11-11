package com.productionhouse.crm.repository.vendor;

import com.productionhouse.crm.common.OwnedRepository;
import com.productionhouse.crm.entity.vendor.VendorInvoice;

public interface VendorInvoiceRepository extends OwnedRepository<VendorInvoice> {

    boolean existsByOwnerIdAndVendorId(Long ownerId, Long vendorId);

    boolean existsByOwnerIdAndPurchaseOrderId(Long ownerId, Long purchaseOrderId);
}
