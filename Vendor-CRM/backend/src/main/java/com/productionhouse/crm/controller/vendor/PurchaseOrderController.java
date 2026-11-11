package com.productionhouse.crm.controller.vendor;

import com.productionhouse.crm.common.CrudController;
import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.entity.vendor.PurchaseOrder;
import com.productionhouse.crm.entity.vendor.Quotation;
import com.productionhouse.crm.entity.vendor.Vendor;
import com.productionhouse.crm.repository.vendor.PurchaseOrderRepository;
import com.productionhouse.crm.repository.vendor.QuotationRepository;
import com.productionhouse.crm.repository.vendor.VendorInvoiceRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vendor/purchase-orders")
public class PurchaseOrderController extends CrudController<PurchaseOrder> {

    private final VendorLinks links;
    private final QuotationRepository quotationRepository;
    private final VendorInvoiceRepository invoiceRepository;

    public PurchaseOrderController(PurchaseOrderRepository repository, VendorLinks links,
                                   QuotationRepository quotationRepository, VendorInvoiceRepository invoiceRepository) {
        super(repository, "Purchase order");
        this.links = links;
        this.quotationRepository = quotationRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @Override
    protected void beforeSave(User user, PurchaseOrder body, PurchaseOrder existing) {
        Vendor vendor = links.vendor(user, body.getVendorId());
        boolean newVendor = existing == null || !vendor.getId().equals(existing.getVendorId());
        if (newVendor && "Blacklisted".equals(vendor.getStatus())) {
            throw VendorLinks.badRequest("This vendor is blacklisted. Choose another vendor.");
        }

        if (body.getQuotationId() != null) {
            Quotation quotation = links.quotation(user, body.getQuotationId(), body.getVendorId());
            if ("Rejected".equals(quotation.getStatus())) {
                throw VendorLinks.badRequest("The selected quotation was rejected.");
            }
            // Raising an order from a quote accepts the quote.
            quotation.setStatus("Accepted");
            quotationRepository.save(quotation);
        }
    }

    @Override
    protected void beforeDelete(User user, PurchaseOrder existing) {
        if (invoiceRepository.existsByOwnerIdAndPurchaseOrderId(user.getWorkspaceId(), existing.getId())) {
            throw VendorLinks.conflict("This purchase order has invoices. Delete those invoices first.");
        }
    }
}
