package com.productionhouse.crm.repository.vendor;

import com.productionhouse.crm.common.OwnedRepository;
import com.productionhouse.crm.entity.vendor.VendorDocument;

public interface VendorDocumentRepository extends OwnedRepository<VendorDocument> {

    boolean existsByOwnerIdAndVendorId(Long ownerId, Long vendorId);
}
