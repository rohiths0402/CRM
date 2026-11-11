import React from "react";
import {
  AlertTriangle,
  Ban,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileSearch,
  FolderCheck,
  IndianRupee,
  ReceiptText,
  ShoppingCart,
  Star,
  Store,
  Wallet,
} from "lucide-react";

import ResourcePage, { StatusBadge } from "../../components/resource/ResourcePage";
import { formatDate, formatMoney, sum, todayIso } from "../../components/resource/format";
import {
  purchaseOrdersApi,
  quotationsApi,
  vendorDocumentsApi,
  vendorInvoicesApi,
  vendorPaymentsApi,
  vendorProjectsApi,
  vendorsApi,
} from "../../services/crmApi";

// Must match the backend's Vendor.CATEGORIES.
export const VENDOR_CATEGORIES = [
  "Equipment Rental",
  "Camera & Lighting",
  "Sound",
  "Catering",
  "Transport",
  "Costumes",
  "Makeup & Hair",
  "Set Construction",
  "Art & Props",
  "VFX",
  "Post Production",
  "Music",
  "Security",
  "Location Services",
  "Printing & Publicity",
  "Other",
];

const STATUS_TONES = {
  Active: "green",
  Inactive: "grey",
  Blacklisted: "red",
  Requested: "blue",
  Received: "gold",
  Accepted: "green",
  Rejected: "red",
  Draft: "grey",
  Issued: "blue",
  Delivered: "gold",
  Closed: "green",
  Cancelled: "grey",
  Pending: "gold",
  Approved: "blue",
  "Partially Paid": "gold",
  Paid: "green",
  Disputed: "red",
  Scheduled: "blue",
  Completed: "green",
  Failed: "red",
  "No Expiry": "grey",
  Valid: "green",
  "Expiring Soon": "gold",
  Expired: "red",
};

const badge = (value) => <StatusBadge value={value} tones={STATUS_TONES} />;

const projectLoader = { projects: vendorProjectsApi.list };

function byId(list, id) {
  return (list || []).find((item) => String(item.id) === String(id));
}

function vendorName(lookups, id) {
  return byId(lookups.vendors, id)?.name || "—";
}

/** Vendors for a dropdown; blacklisted ones are labelled. */
function vendorOptions(lookups) {
  return (lookups.vendors || []).map((v) => ({
    value: String(v.id),
    label: v.status === "Blacklisted" ? `${v.name} (Blacklisted)` : v.name,
  }));
}

/** Project names, keeping a name that is no longer in the list so editing doesn't lose it. */
function projectOptions(lookups, form) {
  const names = lookups.projects || [];
  return form.project && !names.includes(form.project) ? [form.project, ...names] : names;
}

const vendorField = (reset = {}) => ({
  name: "vendorId",
  label: "Vendor",
  type: "select",
  placeholder: "Select vendor",
  required: true,
  numeric: true,
  options: vendorOptions,
  onChange: () => reset,
});

const projectField = {
  name: "project",
  label: "Project",
  type: "select",
  placeholder: "Select project",
  required: true,
  options: projectOptions,
  hint: "OTT projects from the Production CRM.",
};

const notesField = { name: "notes", label: "Notes", type: "textarea", full: true };

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function stacked(primary, secondary) {
  return (
    <>
      <span className="rp-primary-text">{primary}</span>
      {secondary && <span className="rp-sub-text">{secondary}</span>}
    </>
  );
}

/* ---------------- Vendors ---------------- */

const vendorsConfig = {
  eyebrow: "Vendor CRM",
  title: "Vendors",
  description: "Everyone who supplies your productions: rentals, catering, transport, VFX and more.",
  addLabel: "Add Vendor",
  singular: "Vendor",
  api: vendorsApi,
  searchPlaceholder: "Search by name, category, contact, city or GSTIN...",
  searchText: (v) => [v.name, v.category, v.contactPerson, v.email, v.phone, v.city, v.gstNumber].join(" "),
  statusField: "status",
  statusOptions: ["Active", "Inactive", "Blacklisted"],
  emptyText: "No vendors yet. Add the companies you buy from.",
  stats: (records) => {
    const rated = records.filter((v) => v.rating);
    return [
      { label: "Total Vendors", value: records.length, icon: Store, tone: "gold" },
      { label: "Active", value: records.filter((v) => v.status === "Active").length, icon: CheckCircle2, tone: "green" },
      { label: "Categories Used", value: new Set(records.map((v) => v.category)).size, icon: FolderCheck, tone: "blue" },
      {
        label: "Average Rating",
        value: rated.length ? `${(sum(rated, (v) => v.rating) / rated.length).toFixed(1)} ★` : "—",
        icon: Star,
        tone: "gold",
      },
    ];
  },
  columns: [
    { label: "Vendor", render: (v) => stacked(v.name, v.category) },
    { label: "Contact", render: (v) => stacked(v.contactPerson, v.phone) },
    { label: "City", render: (v) => v.city || <span className="rp-muted">—</span> },
    { label: "GSTIN", render: (v) => v.gstNumber || <span className="rp-muted">—</span> },
    { label: "Terms", render: (v) => v.paymentTerms },
    {
      label: "Rating",
      render: (v) =>
        v.rating ? <span className="rp-stars">{"★".repeat(v.rating)}{"☆".repeat(5 - v.rating)}</span> : <span className="rp-muted">—</span>,
    },
    { label: "Status", render: (v) => badge(v.status) },
  ],
  defaults: () => ({ category: "Equipment Rental", paymentTerms: "Net 30", status: "Active", rating: "" }),
  fields: [
    { name: "name", label: "Vendor name", required: true, placeholder: "e.g. Prime Lights Rentals" },
    { name: "category", label: "Category", type: "select", options: VENDOR_CATEGORIES },
    { name: "contactPerson", label: "Contact person", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true, placeholder: "9876543210" },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "city", label: "City" },
    { name: "address", label: "Address", type: "textarea", full: true },
    { name: "gstNumber", label: "GSTIN", placeholder: "33ABCDE1234F1Z5" },
    { name: "panNumber", label: "PAN", placeholder: "ABCDE1234F" },
    { name: "bankName", label: "Bank name" },
    { name: "accountNumber", label: "Account number" },
    { name: "ifscCode", label: "IFSC code", placeholder: "HDFC0001234" },
    {
      name: "paymentTerms",
      label: "Payment terms",
      type: "select",
      options: ["Advance", "On Delivery", "Net 15", "Net 30", "Net 45", "Net 60"],
    },
    {
      name: "rating",
      label: "Rating",
      type: "select",
      numeric: true,
      placeholder: "Not rated",
      options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${"★".repeat(n)} (${n})` })),
    },
    { name: "status", label: "Status", type: "select", options: ["Active", "Inactive", "Blacklisted"] },
    notesField,
  ],
  deleteLabel: (v) => `${v.name} will be removed. Vendors with orders, invoices or documents can't be deleted; set them to Inactive instead.`,
};

/* ---------------- Quotations ---------------- */

const quotationsConfig = {
  eyebrow: "Procurement",
  title: "Quotations",
  description: "Request prices from vendors, compare what comes back, and accept the best one.",
  addLabel: "New Quotation",
  singular: "Quotation",
  api: quotationsApi,
  lookups: { vendors: vendorsApi.list, ...projectLoader },
  searchPlaceholder: "Search by quote number, title, vendor or project...",
  searchText: (q, l) => [q.quoteCode, q.title, q.project, vendorName(l, q.vendorId)].join(" "),
  statusField: "status",
  statusOptions: ["Requested", "Received", "Accepted", "Rejected"],
  emptyText: "No quotations yet.",
  stats: (records) => [
    { label: "Total Quotations", value: records.length, icon: FileSearch, tone: "gold" },
    { label: "Awaiting Price", value: records.filter((q) => q.status === "Requested").length, icon: Clock, tone: "blue" },
    { label: "Awaiting Decision", value: records.filter((q) => q.status === "Received").length, icon: AlertTriangle, tone: "gold" },
    {
      label: "Accepted Value",
      value: formatMoney(sum(records.filter((q) => q.status === "Accepted"), (q) => q.totalAmount)),
      icon: CheckCircle2,
      tone: "green",
    },
  ],
  columns: [
    { label: "Quote", render: (q) => stacked(q.title, q.quoteCode) },
    { label: "Vendor", render: (q, l) => vendorName(l, q.vendorId) },
    { label: "Project", render: (q) => q.project },
    { label: "Requested", render: (q) => stacked(formatDate(q.requestDate), q.validUntil && `Valid till ${formatDate(q.validUntil)}`) },
    { label: "Amount (incl. tax)", render: (q) => (q.totalAmount == null ? <span className="rp-muted">Awaiting price</span> : formatMoney(q.totalAmount)) },
    { label: "Status", render: (q) => badge(q.status) },
  ],
  defaults: () => ({ requestDate: todayIso(), status: "Requested", taxPercent: "18" }),
  fields: [
    vendorField(),
    projectField,
    { name: "title", label: "What is being quoted", required: true, full: true, placeholder: "e.g. Lighting package for 20 shoot days" },
    { name: "requestDate", label: "Request date", type: "date", required: true },
    { name: "validUntil", label: "Valid until", type: "date" },
    { name: "status", label: "Status", type: "select", options: ["Requested", "Received", "Accepted", "Rejected"] },
    { name: "amount", label: "Quoted amount (₹, before tax)", type: "number", hint: "Required once the quote is Received." },
    { name: "taxPercent", label: "GST %", type: "number", step: "0.01" },
    { name: "description", label: "Scope / line items", type: "textarea", full: true },
    notesField,
  ],
  deleteLabel: (q) => `${q.quoteCode} (${q.title}) will be removed.`,
};

/* ---------------- Purchase orders ---------------- */

/** Quotes of the chosen vendor that an order can be raised from. */
function quotationOptions(lookups, form) {
  return (lookups.quotations || [])
    .filter(
      (q) =>
        String(q.vendorId) === String(form.vendorId) &&
        (["Received", "Accepted"].includes(q.status) || String(q.id) === String(form.quotationId))
    )
    .map((q) => ({ value: String(q.id), label: `${q.quoteCode} · ${q.title} · ${formatMoney(q.totalAmount)}` }));
}

const purchaseOrdersConfig = {
  eyebrow: "Procurement",
  title: "Purchase Orders",
  description: "Orders placed with vendors, linked to a project and, optionally, the quote they came from.",
  addLabel: "New Purchase Order",
  singular: "Purchase order",
  api: purchaseOrdersApi,
  lookups: { vendors: vendorsApi.list, quotations: quotationsApi.list, ...projectLoader },
  searchPlaceholder: "Search by PO number, title, vendor or project...",
  searchText: (o, l) => [o.poNumber, o.title, o.project, vendorName(l, o.vendorId)].join(" "),
  statusField: "status",
  statusOptions: ["Draft", "Issued", "Delivered", "Closed", "Cancelled"],
  emptyText: "No purchase orders yet.",
  stats: (records) => {
    const open = records.filter((o) => ["Draft", "Issued"].includes(o.status));
    return [
      { label: "Total Orders", value: records.length, icon: ShoppingCart, tone: "gold" },
      { label: "Open Orders", value: open.length, icon: Clock, tone: "blue" },
      { label: "Open Order Value", value: formatMoney(sum(open, (o) => o.totalAmount)), icon: Wallet, tone: "gold" },
      { label: "Delivered", value: records.filter((o) => ["Delivered", "Closed"].includes(o.status)).length, icon: CheckCircle2, tone: "green" },
    ];
  },
  columns: [
    { label: "Order", render: (o) => stacked(o.title, o.poNumber) },
    { label: "Vendor", render: (o, l) => vendorName(l, o.vendorId) },
    { label: "Project", render: (o) => o.project },
    { label: "Ordered", render: (o) => stacked(formatDate(o.orderDate), o.deliveryDate && `Delivery ${formatDate(o.deliveryDate)}`) },
    { label: "Total (incl. tax)", render: (o) => formatMoney(o.totalAmount) },
    { label: "Status", render: (o) => badge(o.status) },
  ],
  defaults: () => ({ orderDate: todayIso(), status: "Draft", taxPercent: "18" }),
  fields: [
    vendorField({ quotationId: "" }),
    {
      name: "quotationId",
      label: "From quotation",
      type: "select",
      numeric: true,
      placeholder: "None",
      options: quotationOptions,
      hint: "Choosing a quote fills in the details and marks it Accepted.",
      onChange: (value, form, lookups) => {
        const quote = byId(lookups.quotations, value);
        if (!quote) return {};
        return {
          project: quote.project,
          title: quote.title,
          amount: quote.amount == null ? form.amount : String(quote.amount),
          taxPercent: String(quote.taxPercent ?? form.taxPercent),
          description: quote.description || form.description,
        };
      },
    },
    projectField,
    { name: "title", label: "Title", required: true },
    { name: "orderDate", label: "Order date", type: "date", required: true },
    { name: "deliveryDate", label: "Delivery date", type: "date" },
    { name: "amount", label: "Amount (₹, before tax)", type: "number", required: true },
    { name: "taxPercent", label: "GST %", type: "number", step: "0.01" },
    { name: "status", label: "Status", type: "select", options: ["Draft", "Issued", "Delivered", "Closed", "Cancelled"] },
    { name: "description", label: "Items / scope", type: "textarea", full: true },
    notesField,
  ],
  deleteLabel: (o) => `${o.poNumber} (${o.title}) will be removed. Orders with invoices can't be deleted.`,
};

/* ---------------- Invoices ---------------- */

function orderOptions(lookups, form) {
  return (lookups.purchaseOrders || [])
    .filter(
      (o) =>
        String(o.vendorId) === String(form.vendorId) &&
        (o.status !== "Cancelled" || String(o.id) === String(form.purchaseOrderId))
    )
    .map((o) => ({ value: String(o.id), label: `${o.poNumber} · ${o.title} · ${formatMoney(o.totalAmount)}` }));
}

const invoicesConfig = {
  eyebrow: "Procurement",
  title: "Vendor Invoices",
  description: "Bills from vendors. Paid amounts and balances update from Vendor Payments.",
  addLabel: "Add Invoice",
  singular: "Invoice",
  api: vendorInvoicesApi,
  lookups: { vendors: vendorsApi.list, purchaseOrders: purchaseOrdersApi.list },
  searchPlaceholder: "Search by invoice number, vendor or PO...",
  searchText: (i, l) => [i.invoiceNumber, vendorName(l, i.vendorId), byId(l.purchaseOrders, i.purchaseOrderId)?.poNumber].join(" "),
  statusField: "status",
  statusOptions: ["Pending", "Approved", "Partially Paid", "Paid", "Disputed", "Cancelled"],
  emptyText: "No invoices yet.",
  stats: (records) => {
    const open = records.filter((i) => !["Paid", "Cancelled"].includes(i.status) && i.balance > 0);
    return [
      { label: "Unpaid Invoices", value: open.length, icon: ReceiptText, tone: "gold" },
      { label: "Outstanding", value: formatMoney(sum(open, (i) => i.balance)), icon: Wallet, tone: "blue" },
      { label: "Overdue", value: formatMoney(sum(open.filter((i) => i.overdue), (i) => i.balance)), icon: AlertTriangle, tone: "red" },
      { label: "Paid So Far", value: formatMoney(sum(records, (i) => i.paidAmount)), icon: CheckCircle2, tone: "green" },
    ];
  },
  columns: [
    { label: "Invoice", render: (i, l) => stacked(i.invoiceNumber, byId(l.purchaseOrders, i.purchaseOrderId)?.poNumber) },
    { label: "Vendor", render: (i, l) => vendorName(l, i.vendorId) },
    { label: "Invoice date", render: (i) => formatDate(i.invoiceDate) },
    {
      label: "Due",
      render: (i) => (i.overdue ? <span className="rp-overdue">{formatDate(i.dueDate)} · Overdue</span> : formatDate(i.dueDate)),
    },
    { label: "Total", render: (i) => formatMoney(i.totalAmount) },
    { label: "Paid", render: (i) => formatMoney(i.paidAmount) },
    { label: "Balance", render: (i) => <span className="rp-primary-text">{formatMoney(i.balance)}</span> },
    { label: "Status", render: (i) => badge(i.status) },
  ],
  defaults: () => ({ invoiceDate: todayIso(), dueDate: addDays(30), taxAmount: "0", status: "Pending" }),
  fields: [
    vendorField({ purchaseOrderId: "" }),
    {
      name: "purchaseOrderId",
      label: "Purchase order",
      type: "select",
      numeric: true,
      placeholder: "None",
      options: orderOptions,
      hint: "Choosing an order fills in the amount and GST.",
      onChange: (value, form, lookups) => {
        const order = byId(lookups.purchaseOrders, value);
        if (!order) return {};
        const tax = (Number(order.amount) * Number(order.taxPercent || 0)) / 100;
        return { amount: String(order.amount), taxAmount: String(Math.round(tax * 100) / 100) };
      },
    },
    { name: "invoiceNumber", label: "Vendor's invoice number", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Pending", "Approved", "Partially Paid", "Paid", "Disputed", "Cancelled"],
      hint: "Paid and Partially Paid are set automatically from payments.",
    },
    { name: "invoiceDate", label: "Invoice date", type: "date", required: true },
    { name: "dueDate", label: "Due date", type: "date", required: true },
    { name: "amount", label: "Amount (₹, before tax)", type: "number", required: true },
    { name: "taxAmount", label: "GST amount (₹)", type: "number" },
    notesField,
  ],
  deleteLabel: (i) => `Invoice ${i.invoiceNumber} will be removed. Invoices with payments can't be deleted.`,
};

/* ---------------- Payments ---------------- */

function invoiceOptions(lookups, form) {
  return (lookups.invoices || [])
    .filter(
      (i) =>
        String(i.vendorId) === String(form.vendorId) &&
        ((i.status !== "Cancelled" && i.balance > 0) || String(i.id) === String(form.invoiceId))
    )
    .map((i) => ({ value: String(i.id), label: `${i.invoiceNumber} · balance ${formatMoney(i.balance)}` }));
}

const paymentsConfig = {
  eyebrow: "Procurement",
  title: "Vendor Payments",
  description: "Money paid or scheduled to vendors. Completed payments reduce the invoice balance.",
  addLabel: "Record Payment",
  singular: "Payment",
  api: vendorPaymentsApi,
  lookups: { vendors: vendorsApi.list, invoices: vendorInvoicesApi.list },
  searchPlaceholder: "Search by vendor, invoice or reference...",
  searchText: (p, l) => [vendorName(l, p.vendorId), byId(l.invoices, p.invoiceId)?.invoiceNumber, p.reference, p.method].join(" "),
  statusField: "status",
  statusOptions: ["Scheduled", "Completed", "Failed", "Cancelled"],
  emptyText: "No vendor payments yet.",
  stats: (records) => {
    const month = todayIso().slice(0, 7);
    const completed = records.filter((p) => p.status === "Completed");
    return [
      { label: "Paid This Month", value: formatMoney(sum(completed.filter((p) => p.paymentDate?.startsWith(month)), (p) => p.amount)), icon: IndianRupee, tone: "green" },
      { label: "Total Paid", value: formatMoney(sum(completed, (p) => p.amount)), icon: Wallet, tone: "gold" },
      { label: "Scheduled", value: formatMoney(sum(records.filter((p) => p.status === "Scheduled"), (p) => p.amount)), icon: CalendarClock, tone: "blue" },
      { label: "Failed", value: records.filter((p) => p.status === "Failed").length, icon: Ban, tone: "red" },
    ];
  },
  columns: [
    { label: "Vendor", render: (p, l) => <span className="rp-primary-text">{vendorName(l, p.vendorId)}</span> },
    { label: "Invoice", render: (p, l) => byId(l.invoices, p.invoiceId)?.invoiceNumber || <span className="rp-muted">Advance / no invoice</span> },
    { label: "Amount", render: (p) => <span className="rp-primary-text">{formatMoney(p.amount)}</span> },
    { label: "Date", render: (p) => formatDate(p.paymentDate) },
    { label: "Method", render: (p) => stacked(p.method, p.reference) },
    { label: "Status", render: (p) => badge(p.status) },
  ],
  defaults: () => ({ paymentDate: todayIso(), method: "Bank Transfer", status: "Completed" }),
  fields: [
    vendorField({ invoiceId: "" }),
    {
      name: "invoiceId",
      label: "Invoice",
      type: "select",
      numeric: true,
      placeholder: "None (advance payment)",
      options: invoiceOptions,
      hint: "Choosing an invoice fills in its balance.",
      onChange: (value, form, lookups) => {
        const invoice = byId(lookups.invoices, value);
        return invoice ? { amount: String(invoice.balance) } : {};
      },
    },
    { name: "amount", label: "Amount (₹)", type: "number", required: true },
    { name: "paymentDate", label: "Payment date", type: "date", required: true, hint: "Date paid, or scheduled for." },
    { name: "method", label: "Method", type: "select", options: ["Bank Transfer", "UPI", "Cheque", "Cash", "Other"] },
    { name: "reference", label: "Reference / UTR", placeholder: "e.g. UTR or cheque number" },
    { name: "status", label: "Status", type: "select", options: ["Scheduled", "Completed", "Failed", "Cancelled"] },
    notesField,
  ],
  deleteLabel: (p, l) => `The ${formatMoney(p.amount)} payment to ${vendorName(l, p.vendorId)} will be removed and the invoice balance updated.`,
};

/* ---------------- Documents ---------------- */

const DOCUMENT_TYPES = ["GST Certificate", "PAN Card", "Agreement", "Insurance", "NDA", "Bank Details", "Trade License", "Other"];

const documentsConfig = {
  eyebrow: "Vendor CRM",
  title: "Vendor Documents",
  description: "GST certificates, agreements, insurance and other papers, with expiry tracking.",
  addLabel: "Add Document",
  singular: "Document",
  api: vendorDocumentsApi,
  lookups: { vendors: vendorsApi.list },
  searchPlaceholder: "Search by title, type, vendor or number...",
  searchText: (d, l) => [d.title, d.type, d.documentNumber, vendorName(l, d.vendorId)].join(" "),
  statusField: "expiryStatus",
  statusOptions: ["Valid", "Expiring Soon", "Expired", "No Expiry"],
  emptyText: "No documents yet.",
  stats: (records) => [
    { label: "Total Documents", value: records.length, icon: FileCheck2, tone: "gold" },
    { label: "Valid", value: records.filter((d) => ["Valid", "No Expiry"].includes(d.expiryStatus)).length, icon: CheckCircle2, tone: "green" },
    { label: "Expiring in 30 Days", value: records.filter((d) => d.expiryStatus === "Expiring Soon").length, icon: CalendarClock, tone: "gold" },
    { label: "Expired", value: records.filter((d) => d.expiryStatus === "Expired").length, icon: AlertTriangle, tone: "red" },
  ],
  columns: [
    { label: "Document", render: (d) => stacked(d.title, d.type) },
    { label: "Vendor", render: (d, l) => vendorName(l, d.vendorId) },
    { label: "Number", render: (d) => d.documentNumber || <span className="rp-muted">—</span> },
    { label: "Issued", render: (d) => formatDate(d.issueDate) },
    { label: "Expires", render: (d) => formatDate(d.expiryDate) },
    { label: "Expiry", render: (d) => badge(d.expiryStatus) },
    {
      label: "File",
      render: (d) =>
        !d.fileName ? (
          <span className="rp-muted">—</span>
        ) : /^https?:\/\//i.test(d.fileName) ? (
          <a className="rp-link" href={d.fileName} target="_blank" rel="noreferrer">Open</a>
        ) : (
          d.fileName
        ),
    },
  ],
  defaults: () => ({ type: "GST Certificate" }),
  fields: [
    vendorField(),
    { name: "type", label: "Type", type: "select", options: DOCUMENT_TYPES },
    { name: "title", label: "Title", required: true, full: true, placeholder: "e.g. GST registration certificate" },
    { name: "documentNumber", label: "Document number" },
    { name: "fileName", label: "File name or link", placeholder: "gst-cert.pdf or https://..." },
    { name: "issueDate", label: "Issue date", type: "date" },
    { name: "expiryDate", label: "Expiry date", type: "date", hint: "Flagged 30 days before it expires." },
    notesField,
  ],
  deleteLabel: (d) => `${d.title} will be removed.`,
};

export const VendorsPage = () => <ResourcePage config={vendorsConfig} />;
export const QuotationsPage = () => <ResourcePage config={quotationsConfig} />;
export const PurchaseOrdersPage = () => <ResourcePage config={purchaseOrdersConfig} />;
export const VendorInvoicesPage = () => <ResourcePage config={invoicesConfig} />;
export const VendorPaymentsPage = () => <ResourcePage config={paymentsConfig} />;
export const VendorDocumentsPage = () => <ResourcePage config={documentsConfig} />;
