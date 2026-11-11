package com.productionhouse.crm.controller.vendor;

import com.productionhouse.crm.common.CrudController;
import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.entity.vendor.VendorInvoice;
import com.productionhouse.crm.entity.vendor.VendorPayment;
import com.productionhouse.crm.repository.vendor.VendorPaymentRepository;
import java.math.BigDecimal;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vendor/payments")
public class VendorPaymentController extends CrudController<VendorPayment> {

    private final VendorLinks links;
    private final InvoiceBalances balances;

    public VendorPaymentController(VendorPaymentRepository repository, VendorLinks links, InvoiceBalances balances) {
        super(repository, "Payment");
        this.links = links;
        this.balances = balances;
    }

    @Override
    protected void beforeSave(User user, VendorPayment body, VendorPayment existing) {
        links.vendor(user, body.getVendorId());
        if (body.getInvoiceId() == null) {
            return;
        }

        VendorInvoice invoice = links.invoice(user, body.getInvoiceId(), body.getVendorId());
        if ("Cancelled".equals(invoice.getStatus())) {
            throw VendorLinks.badRequest("This invoice is cancelled.");
        }
        if ("Completed".equals(body.getStatus())) {
            BigDecimal remaining = balances.remaining(invoice, user.getWorkspaceId(),
                    existing == null ? null : existing.getId());
            if (body.getAmount().compareTo(remaining) > 0) {
                throw VendorLinks.badRequest("Amount is more than the invoice balance of ₹"
                        + remaining.toPlainString() + ".");
            }
        }
    }

    @Override
    protected void afterChange(User user) {
        balances.refresh(user.getWorkspaceId());
    }
}
