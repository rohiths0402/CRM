package com.productionhouse.crm.controller.vendor;

import com.productionhouse.crm.entity.vendor.VendorInvoice;
import com.productionhouse.crm.entity.vendor.VendorPayment;
import com.productionhouse.crm.repository.vendor.VendorInvoiceRepository;
import com.productionhouse.crm.repository.vendor.VendorPaymentRepository;
import java.math.BigDecimal;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/** Keeps each invoice's paidAmount, and its paid status, in step with its completed payments. */
@Component
public class InvoiceBalances {

    private final VendorInvoiceRepository invoiceRepository;
    private final VendorPaymentRepository paymentRepository;

    public InvoiceBalances(VendorInvoiceRepository invoiceRepository, VendorPaymentRepository paymentRepository) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
    }

    public void refresh(Long workspaceId) {
        Map<Long, BigDecimal> paid = paymentRepository.findAllByOwnerIdOrderByCreatedAtDesc(workspaceId).stream()
                .filter(p -> p.getInvoiceId() != null && "Completed".equals(p.getStatus()))
                .collect(Collectors.groupingBy(VendorPayment::getInvoiceId,
                        Collectors.reducing(BigDecimal.ZERO, VendorPayment::getAmount, BigDecimal::add)));

        for (VendorInvoice invoice : invoiceRepository.findAllByOwnerIdOrderByCreatedAtDesc(workspaceId)) {
            BigDecimal paidAmount = paid.getOrDefault(invoice.getId(), BigDecimal.ZERO);
            String status = statusFor(invoice, paidAmount);
            if (invoice.getPaidAmount().compareTo(paidAmount) != 0 || !Objects.equals(invoice.getStatus(), status)) {
                invoice.setPaidAmount(paidAmount);
                invoice.setStatus(status);
                invoiceRepository.save(invoice);
            }
        }
    }

    /** Paid and Partially Paid follow the payments; any other status was set by a person and is kept. */
    private static String statusFor(VendorInvoice invoice, BigDecimal paidAmount) {
        String status = invoice.getStatus();
        if ("Cancelled".equals(status) || "Disputed".equals(status)) {
            return status;
        }
        if (paidAmount.signum() > 0) {
            return paidAmount.compareTo(invoice.getTotalAmount()) >= 0 ? "Paid" : "Partially Paid";
        }
        return "Paid".equals(status) || "Partially Paid".equals(status) ? "Approved" : status;
    }

    /** What is still owed on the invoice, not counting the payment being edited. */
    public BigDecimal remaining(VendorInvoice invoice, Long workspaceId, Long excludingPaymentId) {
        BigDecimal paidByOthers = paymentRepository.findAllByOwnerIdAndInvoiceId(workspaceId, invoice.getId()).stream()
                .filter(p -> "Completed".equals(p.getStatus()) && !p.getId().equals(excludingPaymentId))
                .map(VendorPayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return invoice.getTotalAmount().subtract(paidByOthers);
    }
}
