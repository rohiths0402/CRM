package com.productionhouse.crm.service;

import com.productionhouse.crm.entity.vendor.PurchaseOrder;
import com.productionhouse.crm.entity.vendor.Quotation;
import com.productionhouse.crm.entity.vendor.Vendor;
import com.productionhouse.crm.entity.vendor.VendorDocument;
import com.productionhouse.crm.entity.vendor.VendorInvoice;
import com.productionhouse.crm.entity.vendor.VendorPayment;
import com.productionhouse.crm.repository.vendor.PurchaseOrderRepository;
import com.productionhouse.crm.repository.vendor.QuotationRepository;
import com.productionhouse.crm.repository.vendor.VendorDocumentRepository;
import com.productionhouse.crm.repository.vendor.VendorInvoiceRepository;
import com.productionhouse.crm.repository.vendor.VendorPaymentRepository;
import com.productionhouse.crm.repository.vendor.VendorRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Everything the vendor dashboard shows, computed from the workspace's vendor records. */
@Service
public class VendorDashboardService {

    private static final int LIST_SIZE = 5;
    private static final int UPCOMING_DAYS = 14;
    private static final Set<String> OPEN_ORDER = Set.of("Draft", "Issued");
    private static final Set<String> SETTLED_INVOICE = Set.of("Paid", "Cancelled");

    private final VendorRepository vendorRepository;
    private final QuotationRepository quotationRepository;
    private final PurchaseOrderRepository orderRepository;
    private final VendorInvoiceRepository invoiceRepository;
    private final VendorPaymentRepository paymentRepository;
    private final VendorDocumentRepository documentRepository;

    public VendorDashboardService(VendorRepository vendorRepository, QuotationRepository quotationRepository,
                                  PurchaseOrderRepository orderRepository, VendorInvoiceRepository invoiceRepository,
                                  VendorPaymentRepository paymentRepository,
                                  VendorDocumentRepository documentRepository) {
        this.vendorRepository = vendorRepository;
        this.quotationRepository = quotationRepository;
        this.orderRepository = orderRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.documentRepository = documentRepository;
    }

    public record Stats(long activeVendors, long totalVendors, long openPurchaseOrders, BigDecimal openOrderValue,
                        long unpaidInvoices, BigDecimal outstanding, BigDecimal overdue, BigDecimal paidThisMonth) {
    }

    /** requested: waiting for the vendor's price; received: waiting for our decision. */
    public record QuotationSummary(long requested, long received, long accepted, long rejected) {
    }

    public record CategorySpend(String category, BigDecimal amount) {
    }

    public record TopVendor(Long id, String name, String category, long orders, BigDecimal orderValue,
                            Integer rating) {
    }

    public record DuePayment(Long invoiceId, String invoiceNumber, Long vendorId, String vendorName,
                             LocalDate dueDate, BigDecimal balance, boolean overdue) {
    }

    public record DocumentAlert(Long id, String title, String type, Long vendorId, String vendorName,
                                LocalDate expiryDate, String expiryStatus) {
    }

    public record RecentOrder(Long id, String poNumber, Long vendorId, String vendorName, String project,
                              BigDecimal totalAmount, String status, LocalDate orderDate) {
    }

    public record Summary(Stats stats, QuotationSummary quotations, List<CategorySpend> spendByCategory,
                          List<TopVendor> topVendors, List<DuePayment> duePayments,
                          List<DocumentAlert> documentAlerts, List<RecentOrder> recentOrders) {
    }

    @Transactional(readOnly = true)
    public Summary summary(Long ownerId) {
        LocalDate today = LocalDate.now();

        List<Vendor> vendors = vendorRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId);
        List<Quotation> quotations = quotationRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId);
        List<PurchaseOrder> orders = orderRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId);
        List<VendorInvoice> invoices = invoiceRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId);
        List<VendorPayment> payments = paymentRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId);
        List<VendorDocument> documents = documentRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId);

        Map<Long, Vendor> vendorById = vendors.stream().collect(Collectors.toMap(Vendor::getId, Function.identity()));
        Function<Long, String> vendorName = id -> vendorById.containsKey(id) ? vendorById.get(id).getName() : "";

        List<PurchaseOrder> openOrders = orders.stream().filter(o -> OPEN_ORDER.contains(o.getStatus())).toList();
        List<VendorInvoice> unpaid = invoices.stream()
                .filter(i -> !SETTLED_INVOICE.contains(i.getStatus()) && i.getBalance().signum() > 0)
                .toList();
        List<VendorPayment> completed = payments.stream().filter(p -> "Completed".equals(p.getStatus())).toList();
        YearMonth thisMonth = YearMonth.from(today);

        Stats stats = new Stats(
                vendors.stream().filter(v -> "Active".equals(v.getStatus())).count(),
                vendors.size(),
                openOrders.size(),
                sum(openOrders.stream().map(PurchaseOrder::getTotalAmount).toList()),
                unpaid.size(),
                sum(unpaid.stream().map(VendorInvoice::getBalance).toList()),
                sum(unpaid.stream().filter(VendorInvoice::isOverdue).map(VendorInvoice::getBalance).toList()),
                sum(completed.stream().filter(p -> YearMonth.from(p.getPaymentDate()).equals(thisMonth))
                        .map(VendorPayment::getAmount).toList()));

        Map<String, Long> quoteCounts = quotations.stream()
                .collect(Collectors.groupingBy(Quotation::getStatus, Collectors.counting()));
        QuotationSummary quotationSummary = new QuotationSummary(quoteCounts.getOrDefault("Requested", 0L),
                quoteCounts.getOrDefault("Received", 0L), quoteCounts.getOrDefault("Accepted", 0L),
                quoteCounts.getOrDefault("Rejected", 0L));

        List<CategorySpend> spendByCategory = completed.stream()
                .filter(p -> vendorById.containsKey(p.getVendorId()))
                .collect(Collectors.groupingBy(p -> vendorById.get(p.getVendorId()).getCategory(),
                        Collectors.reducing(BigDecimal.ZERO, VendorPayment::getAmount, BigDecimal::add)))
                .entrySet().stream()
                .map(e -> new CategorySpend(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(CategorySpend::amount).reversed())
                .toList();

        List<PurchaseOrder> liveOrders = orders.stream().filter(o -> !"Cancelled".equals(o.getStatus())).toList();
        List<TopVendor> topVendors = liveOrders.stream()
                .collect(Collectors.groupingBy(PurchaseOrder::getVendorId))
                .entrySet().stream()
                .filter(e -> vendorById.containsKey(e.getKey()))
                .map(e -> {
                    Vendor v = vendorById.get(e.getKey());
                    return new TopVendor(v.getId(), v.getName(), v.getCategory(), e.getValue().size(),
                            sum(e.getValue().stream().map(PurchaseOrder::getTotalAmount).toList()), v.getRating());
                })
                .sorted(Comparator.comparing(TopVendor::orderValue).reversed())
                .limit(LIST_SIZE)
                .toList();

        List<DuePayment> duePayments = unpaid.stream()
                .filter(i -> !i.getDueDate().isAfter(today.plusDays(UPCOMING_DAYS)))
                .sorted(Comparator.comparing(VendorInvoice::getDueDate))
                .limit(LIST_SIZE)
                .map(i -> new DuePayment(i.getId(), i.getInvoiceNumber(), i.getVendorId(),
                        vendorName.apply(i.getVendorId()), i.getDueDate(), i.getBalance(), i.isOverdue()))
                .toList();

        List<DocumentAlert> documentAlerts = documents.stream()
                .filter(d -> Set.of("Expired", "Expiring Soon").contains(d.getExpiryStatus()))
                .sorted(Comparator.comparing(VendorDocument::getExpiryDate))
                .limit(LIST_SIZE)
                .map(d -> new DocumentAlert(d.getId(), d.getTitle(), d.getType(), d.getVendorId(),
                        vendorName.apply(d.getVendorId()), d.getExpiryDate(), d.getExpiryStatus()))
                .toList();

        List<RecentOrder> recentOrders = orders.stream()
                .limit(LIST_SIZE)
                .map(o -> new RecentOrder(o.getId(), o.getPoNumber(), o.getVendorId(), vendorName.apply(o.getVendorId()),
                        o.getProject(), o.getTotalAmount(), o.getStatus(), o.getOrderDate()))
                .toList();

        return new Summary(stats, quotationSummary, spendByCategory, topVendors, duePayments, documentAlerts,
                recentOrders);
    }

    private static BigDecimal sum(List<BigDecimal> values) {
        return values.stream().filter(v -> v != null).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
