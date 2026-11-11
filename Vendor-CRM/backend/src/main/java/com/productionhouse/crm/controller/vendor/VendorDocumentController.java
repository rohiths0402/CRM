package com.productionhouse.crm.controller.vendor;

import com.productionhouse.crm.common.CrudController;
import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.entity.vendor.VendorDocument;
import com.productionhouse.crm.repository.vendor.VendorDocumentRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vendor/documents")
public class VendorDocumentController extends CrudController<VendorDocument> {

    private final VendorLinks links;

    public VendorDocumentController(VendorDocumentRepository repository, VendorLinks links) {
        super(repository, "Document");
        this.links = links;
    }

    @Override
    protected void beforeSave(User user, VendorDocument body) {
        links.vendor(user, body.getVendorId());
    }
}
