import {
  CalendarDays,
  Download,
  FileText,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import Button from "../common/Button";
import Drawer from "../common/Drawer";
import {
  DELIVERABLE_STATUS,
  PAYMENT_STATUS,
  SPONSOR_TIERS,
} from "../../constants/sponsors";
import { formatCurrency, formatDate, formatPercent } from "../../utils/format";
import { deliverableStats, fileSize, isOverdue } from "./sponsorHelpers";

const statusOptions = Object.entries(DELIVERABLE_STATUS);

const Summary = ({ label, value, tone = "" }) => (
  <div className="rounded-xl border border-line bg-elevated px-3 py-2.5 text-center">
    <p className={`text-lg font-semibold ${tone}`}>{value}</p>
    <p className="text-[11px] text-muted">{label}</p>
  </div>
);

const generateNativePdfBlob = (sponsor) => {
  const sanitize = (text) => String(text || "").replace(/[()\\]/g, "");

  const tierName = SPONSOR_TIERS[sponsor.tier]?.label || sponsor.tier;
  const payLabel =
    PAYMENT_STATUS[sponsor.paymentStatus]?.label || sponsor.paymentStatus;
  const balance = Math.max(sponsor.contractValue - sponsor.amountReceived, 0);

  const lines = [
    `SPONSORSHIP AGREEMENT AND CONTRACT`,
    `Brand: ${sanitize(sponsor.brandName)}`,
    `Industry: ${sanitize(sponsor.industry)}`,
    `Sponsorship Tier: ${sanitize(tierName)}`,
    `Event: ${sanitize(sponsor.eventTitle)} (${formatDate(sponsor.eventDate)})`,
    `----------------------------------------------------------------------`,
    `FINANCIAL SUMMARY:`,
    `Contract Value: INR ${formatCurrency(sponsor.contractValue)}`,
    `Amount Received: INR ${formatCurrency(sponsor.amountReceived)}`,
    `Outstanding Balance: INR ${formatCurrency(balance)}`,
    `Payment Status: ${sanitize(payLabel)}`,
    `----------------------------------------------------------------------`,
    `BRAND CONTACT:`,
    `Contact Person: ${sanitize(sponsor.contactName)}`,
    `Email: ${sanitize(sponsor.contactEmail)}`,
    `Phone: ${sanitize(sponsor.contactPhone)}`,
    `----------------------------------------------------------------------`,
    `DELIVERABLES AND SCOPE OF WORK:`,
    ...(sponsor.deliverables || []).map(
      (d, i) =>
        `${i + 1}. [${d.status}] ${sanitize(d.text)} (Due: ${d.dueDate})`,
    ),
    `----------------------------------------------------------------------`,
    `Digitally Verified & Signed through Event CRM System`,
  ];

  let stream = "BT\n/F1 11 Tf\n50 780 Td\n18 TL\n";
  lines.forEach((line) => {
    stream += `(${line}) Tj\nT*\n`;
  });
  stream += "ET";

  const pdfBody = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length ${stream.length} >>
stream
${stream}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000318 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
${420 + stream.length}
%%EOF`;

  return new Blob([pdfBody], { type: "application/pdf" });
};

const SponsorDrawer = ({
  sponsor,
  canDelete,
  busyId,
  onClose,
  onEdit,
  onDelete,
  onAddDeliverable,
  onEditDeliverable,
  onDeleteDeliverable,
  onChangeStatus,
}) => {
  const open = Boolean(sponsor);
  const stats = sponsor ? deliverableStats(sponsor) : null;
  const balance = sponsor
    ? Math.max(sponsor.contractValue - sponsor.amountReceived, 0)
    : 0;
  const receivedPercent = sponsor
    ? formatPercent(sponsor.amountReceived, sponsor.contractValue)
    : 0;
  const items = sponsor
    ? [...sponsor.deliverables].sort((a, b) =>
        a.dueDate.localeCompare(b.dueDate),
      )
    : [];

  const handleDownloadContract = () => {
    if (!sponsor) return;

    let downloadUrl = sponsor.contractFile?.url;
    let isCreatedBlob = false;

    if (!downloadUrl) {
      const blob = generateNativePdfBlob(sponsor);
      downloadUrl = URL.createObjectURL(blob);
      isCreatedBlob = true;
    }

    const fileName =
      sponsor.contractFile?.name && sponsor.contractFile.name.endsWith(".pdf")
        ? sponsor.contractFile.name
        : `${sponsor.brandName.replace(/\s+/g, "_")}_Contract.pdf`;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (isCreatedBlob) {
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    }

    toast.success("PDF Contract downloaded");
  };

  return (
    <Drawer open={open} onClose={onClose} title="Sponsor details">
      {sponsor && (
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${SPONSOR_TIERS[sponsor.tier]?.tone || ""}`}
              >
                {SPONSOR_TIERS[sponsor.tier]?.label || sponsor.tier}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${PAYMENT_STATUS[sponsor.paymentStatus]?.tone || ""}`}
              >
                {PAYMENT_STATUS[sponsor.paymentStatus]?.label ||
                  sponsor.paymentStatus}
              </span>
            </div>
            <h3 className="mt-3 font-display text-3xl font-semibold leading-tight">
              {sponsor.brandName}
            </h3>
            <p className="mt-1 text-sm text-muted">{sponsor.industry}</p>
            <p className="mt-3 flex items-center gap-2 text-sm">
              <CalendarDays className="size-4 shrink-0 text-primary" />
              {sponsor.eventTitle} · {formatDate(sponsor.eventDate)}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-end justify-between">
              <p className="text-sm font-semibold">Payment Status</p>
              <p className="text-sm text-muted">{receivedPercent}% received</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
                style={{ width: `${Math.min(receivedPercent, 100)}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted">Contract value</p>
                <p className="mt-0.5 text-sm font-semibold">
                  {formatCurrency(sponsor.contractValue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Received</p>
                <p className="mt-0.5 text-sm font-semibold text-emerald-500">
                  {formatCurrency(sponsor.amountReceived)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Balance</p>
                <p className="mt-0.5 text-sm font-semibold text-amber-500">
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {sponsor.contractFile?.name ||
                      `${sponsor.brandName} Agreement`}
                  </p>
                  <p className="text-xs text-muted">
                    {sponsor.contractFile?.size
                      ? fileSize(sponsor.contractFile.size)
                      : "Verified digital PDF contract"}
                  </p>
                </div>
              </div>

              <Button
                className="h-9 shrink-0 gap-1.5 px-3"
                onClick={handleDownloadContract}
              >
                <Download className="size-3.5" />
                Download PDF
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card p-4">
            <p className="text-xs text-muted">Brand contact</p>
            <p className="mt-0.5 text-sm font-semibold">
              {sponsor.contactName}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`mailto:${sponsor.contactEmail}`}
                className="flex items-center gap-2 rounded-full border border-line bg-elevated px-4 py-2 text-sm transition hover:border-primary"
              >
                <Mail className="size-4 text-primary" />
                {sponsor.contactEmail}
              </a>
              <a
                href={`tel:${sponsor.contactPhone}`}
                className="flex items-center gap-2 rounded-full border border-line bg-elevated px-4 py-2 text-sm transition hover:border-primary"
              >
                <Phone className="size-4 text-primary" />
                {sponsor.contactPhone}
              </a>
            </div>
          </div>

          <section>
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-semibold">Deliverables checklist</h4>
              <Button
                variant="ghost"
                className="h-9 px-4"
                onClick={onAddDeliverable}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              <Summary
                label="Done"
                value={stats?.done ?? 0}
                tone="text-emerald-500"
              />
              <Summary
                label="In review"
                value={stats?.inReview ?? 0}
                tone="text-sky-500"
              />
              <Summary
                label="Pending"
                value={stats?.pending ?? 0}
                tone="text-amber-500"
              />
              <Summary
                label="Overdue"
                value={stats?.overdue ?? 0}
                tone={stats?.overdue ? "text-rose-500" : ""}
              />
            </div>

            <div className="mt-4 space-y-3">
              {items.map((item) => {
                const overdue = isOverdue(item);
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-line bg-card p-4"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.status === "DONE"}
                        disabled={busyId === item.id}
                        onChange={(change) =>
                          onChangeStatus(
                            item,
                            change.target.checked ? "DONE" : "PENDING",
                          )
                        }
                        aria-label={`Mark ${item.text} as done`}
                        className="mt-1 size-4 shrink-0 accent-[var(--primary)]"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${item.status === "DONE" ? "text-muted line-through" : ""}`}
                        >
                          {item.text}
                        </p>
                        <p
                          className={`mt-1 flex items-center gap-1.5 text-xs ${overdue ? "font-semibold text-rose-500" : "text-muted"}`}
                        >
                          {overdue && <TriangleAlert className="size-3.5" />}
                          {overdue ? "Overdue, was due" : "Due"}{" "}
                          {formatDate(item.dueDate)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 pl-7">
                      <select
                        value={item.status}
                        disabled={busyId === item.id}
                        onChange={(change) =>
                          onChangeStatus(item, change.target.value)
                        }
                        aria-label={`Status of ${item.text}`}
                        className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${DELIVERABLE_STATUS[item.status]?.tone || ""}`}
                      >
                        {statusOptions.map(([value, { label }]) => (
                          <option
                            key={value}
                            value={value}
                            className="bg-elevated text-foreground"
                          >
                            {label}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onEditDeliverable(item)}
                          aria-label={`Edit ${item.text}`}
                          className="grid size-8 place-items-center rounded-full border border-line bg-elevated text-muted transition hover:text-foreground"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteDeliverable(item)}
                          aria-label={`Remove ${item.text}`}
                          className="grid size-8 place-items-center rounded-full border border-line bg-elevated text-muted transition hover:text-rose-500"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!items.length && (
                <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
                  No deliverables yet. Add commitments like LED logo placement
                  or VIP passes.
                </p>
              )}
            </div>
          </section>

          <div className="border-t border-line pt-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1" onClick={() => onEdit(sponsor)}>
                <Pencil className="size-4" />
                Edit sponsor
              </Button>
              {canDelete && (
                <Button
                  variant="ghost"
                  className="flex-1 text-rose-500"
                  disabled={sponsor.amountReceived > 0}
                  onClick={() => onDelete(sponsor)}
                >
                  <Trash2 className="size-4" />
                  Delete sponsor
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default SponsorDrawer;
