package com.productionhouse.crm.repository.vendor;

import com.productionhouse.crm.common.OwnedRepository;
import com.productionhouse.crm.entity.vendor.VendorPayment;
import java.util.List;

public interface VendorPaymentRepository extends OwnedRepository<VendorPayment> {

    boolean existsByOwnerIdAndVendorId(Long ownerId, Long vendorId);

    boolean existsByOwnerIdAndInvoiceId(Long ownerId, Long invoiceId);

    List<VendorPayment> findAllByOwnerIdAndInvoiceId(Long ownerId, Long invoiceId);
}
