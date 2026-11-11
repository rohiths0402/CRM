package com.productionhouse.crm.controller.vendor;

import com.productionhouse.crm.common.CrudController;
import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.entity.vendor.VendorInvoice;
import com.productionhouse.crm.repository.vendor.VendorInvoiceRepository;
import com.productionhouse.crm.repository.vendor.VendorPaymentRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vendor/invoices")
public class VendorInvoiceController extends CrudController<VendorInvoice> {

    private final VendorLinks links;
    private final VendorPaymentRepository paymentRepository;
    private final InvoiceBalances balances;

    public VendorInvoiceController(VendorInvoiceRepository repository, VendorLinks links,
                                   VendorPaymentRepository paymentRepository, InvoiceBalances balances) {
        super(repository, "Invoice");
        this.links = links;
        this.paymentRepository = paymentRepository;
        this.balances = balances;
    }

    @Override
    protected void beforeSave(User user, VendorInvoice body, VendorInvoice existing) {
        links.vendor(user, body.getVendorId());
        if (body.getPurchaseOrderId() != null) {
            links.purchaseOrder(user, body.getPurchaseOrderId(), body.getVendorId());
        }
        if (existing != null && !existing.getVendorId().equals(body.getVendorId())
                && paymentRepository.existsByOwnerIdAndInvoiceId(user.getWorkspaceId(), existing.getId())) {
            throw VendorLinks.badRequest("This invoice has payments, so its vendor can't be changed.");
        }
        if (existing != null && body.getTotalAmount().compareTo(existing.getPaidAmount()) < 0) {
            throw VendorLinks.badRequest("The invoice total can't be less than the ₹"
                    + existing.getPaidAmount().toPlainString() + " already paid.");
        }
    }

    @Override
    protected void afterChange(User user) {
        // An edited amount or status changes what the payments add up to.
        balances.refresh(user.getWorkspaceId());
    }

    @Override
    protected String[] readOnlyFields() {
        return VendorInvoice.SERVER_FIELDS;
    }

    @Override
    protected void beforeDelete(User user, VendorInvoice existing) {
        if (paymentRepository.existsByOwnerIdAndInvoiceId(user.getWorkspaceId(), existing.getId())) {
            throw VendorLinks.conflict("This invoice has payments recorded against it. Delete those payments first.");
        }
    }
}
