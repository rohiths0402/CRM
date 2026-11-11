package com.productionhouse.crm.controller.vendor;

import com.productionhouse.crm.common.CrudController;
import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.entity.vendor.Vendor;
import com.productionhouse.crm.repository.vendor.PurchaseOrderRepository;
import com.productionhouse.crm.repository.vendor.QuotationRepository;
import com.productionhouse.crm.repository.vendor.VendorDocumentRepository;
import com.productionhouse.crm.repository.vendor.VendorInvoiceRepository;
import com.productionhouse.crm.repository.vendor.VendorPaymentRepository;
import com.productionhouse.crm.repository.vendor.VendorRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vendor/vendors")
public class VendorController extends CrudController<Vendor> {

    private final QuotationRepository quotationRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final VendorInvoiceRepository invoiceRepository;
    private final VendorPaymentRepository paymentRepository;
    private final VendorDocumentRepository documentRepository;

    public VendorController(VendorRepository repository, QuotationRepository quotationRepository,
                            PurchaseOrderRepository purchaseOrderRepository, VendorInvoiceRepository invoiceRepository,
                            VendorPaymentRepository paymentRepository, VendorDocumentRepository documentRepository) {
        super(repository, "Vendor");
        this.quotationRepository = quotationRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.documentRepository = documentRepository;
    }

    @Override
    protected void beforeDelete(User user, Vendor existing) {
        Long owner = user.getWorkspaceId();
        Long id = existing.getId();
        if (quotationRepository.existsByOwnerIdAndVendorId(owner, id)
                || purchaseOrderRepository.existsByOwnerIdAndVendorId(owner, id)
                || invoiceRepository.existsByOwnerIdAndVendorId(owner, id)
                || paymentRepository.existsByOwnerIdAndVendorId(owner, id)
                || documentRepository.existsByOwnerIdAndVendorId(owner, id)) {
            throw VendorLinks.conflict("This vendor has quotations, orders, invoices, payments or documents. "
                    + "Delete those first, or set the vendor to Inactive instead.");
        }
    }
}
