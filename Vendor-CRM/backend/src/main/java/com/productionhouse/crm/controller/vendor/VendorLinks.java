package com.productionhouse.crm.controller.vendor;

import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.entity.vendor.PurchaseOrder;
import com.productionhouse.crm.entity.vendor.Quotation;
import com.productionhouse.crm.entity.vendor.Vendor;
import com.productionhouse.crm.entity.vendor.VendorInvoice;
import com.productionhouse.crm.exception.ApiException;
import com.productionhouse.crm.repository.vendor.PurchaseOrderRepository;
import com.productionhouse.crm.repository.vendor.QuotationRepository;
import com.productionhouse.crm.repository.vendor.VendorInvoiceRepository;
import com.productionhouse.crm.repository.vendor.VendorRepository;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/** Checks that ids sent by the client point at records in the user's workspace and agree with each other. */
@Component
public class VendorLinks {

    private final VendorRepository vendorRepository;
    private final QuotationRepository quotationRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final VendorInvoiceRepository invoiceRepository;

    public VendorLinks(VendorRepository vendorRepository, QuotationRepository quotationRepository,
                       PurchaseOrderRepository purchaseOrderRepository, VendorInvoiceRepository invoiceRepository) {
        this.vendorRepository = vendorRepository;
        this.quotationRepository = quotationRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.invoiceRepository = invoiceRepository;
    }

    public Vendor vendor(User user, Long vendorId) {
        return vendorRepository.findByIdAndOwnerId(vendorId, user.getWorkspaceId())
                .orElseThrow(() -> badRequest("Selected vendor does not exist."));
    }

    public Quotation quotation(User user, Long quotationId, Long vendorId) {
        Quotation quotation = quotationRepository.findByIdAndOwnerId(quotationId, user.getWorkspaceId())
                .orElseThrow(() -> badRequest("Selected quotation does not exist."));
        if (!Objects.equals(quotation.getVendorId(), vendorId)) {
            throw badRequest("The selected quotation belongs to a different vendor.");
        }
        return quotation;
    }

    public PurchaseOrder purchaseOrder(User user, Long purchaseOrderId, Long vendorId) {
        PurchaseOrder order = purchaseOrderRepository.findByIdAndOwnerId(purchaseOrderId, user.getWorkspaceId())
                .orElseThrow(() -> badRequest("Selected purchase order does not exist."));
        if (!Objects.equals(order.getVendorId(), vendorId)) {
            throw badRequest("The selected purchase order belongs to a different vendor.");
        }
        return order;
    }

    public VendorInvoice invoice(User user, Long invoiceId, Long vendorId) {
        VendorInvoice invoice = invoiceRepository.findByIdAndOwnerId(invoiceId, user.getWorkspaceId())
                .orElseThrow(() -> badRequest("Selected invoice does not exist."));
        if (!Objects.equals(invoice.getVendorId(), vendorId)) {
            throw badRequest("The selected invoice belongs to a different vendor.");
        }
        return invoice;
    }

    static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    static ApiException conflict(String message) {
        return new ApiException(HttpStatus.CONFLICT, message);
    }
}
