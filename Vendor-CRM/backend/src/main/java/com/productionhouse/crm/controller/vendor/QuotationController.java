package com.productionhouse.crm.controller.vendor;

import com.productionhouse.crm.common.CrudController;
import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.entity.vendor.Quotation;
import com.productionhouse.crm.repository.vendor.PurchaseOrderRepository;
import com.productionhouse.crm.repository.vendor.QuotationRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vendor/quotations")
public class QuotationController extends CrudController<Quotation> {

    private final VendorLinks links;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public QuotationController(QuotationRepository repository, VendorLinks links,
                               PurchaseOrderRepository purchaseOrderRepository) {
        super(repository, "Quotation");
        this.links = links;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    @Override
    protected void beforeSave(User user, Quotation body) {
        links.vendor(user, body.getVendorId());
    }

    @Override
    protected void beforeDelete(User user, Quotation existing) {
        if (purchaseOrderRepository.existsByOwnerIdAndQuotationId(user.getWorkspaceId(), existing.getId())) {
            throw VendorLinks.conflict("A purchase order was raised from this quotation. Delete that order first.");
        }
    }
}
