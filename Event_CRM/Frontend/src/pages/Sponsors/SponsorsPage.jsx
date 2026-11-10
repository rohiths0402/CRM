import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Download,
  ExternalLink,
  Handshake,
  Pencil,
  Plus,
  Search,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import { SelectField } from "../../components/common/FormControls";
import SponsorStats from "../../components/sponsors/SponsorStats";
import SponsorDrawer from "../../components/sponsors/SponsorDrawer";
import SponsorFormModal from "../../components/sponsors/SponsorFormModal";
import DeliverableFormModal from "../../components/sponsors/DeliverableFormModal";
import { useAuth } from "../../context/AuthContext";
import { eventService } from "../../api/services/eventService";
import { sponsorService } from "../../api/services/sponsorService";
import { PAYMENT_STATUS, SPONSOR_TIERS } from "../../constants/sponsors";
import { ROLES } from "../../constants/roles";
import { formatCurrency, formatDate, formatPercent } from "../../utils/format";
import { deliverableStats } from "../../components/sponsors/sponsorHelpers";

const toOptions = (map) =>
  Object.entries(map).map(([value, { label }]) => ({ value, label }));

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

const SponsorsPage = () => {
  const { user } = useAuth();
  const [sponsors, setSponsors] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [sponsorModal, setSponsorModal] = useState({
    open: false,
    editing: null,
  });
  const [deliverableModal, setDeliverableModal] = useState({
    open: false,
    editing: null,
  });
  const [deletingSponsor, setDeletingSponsor] = useState(null);
  const [deletingDeliverable, setDeletingDeliverable] = useState(null);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const canDelete = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role);

  useEffect(() => {
    Promise.all([sponsorService.list(), eventService.list()])
      .then(([sponsorResult, eventResult]) => {
        setSponsors(sponsorResult.sponsors);
        setEvents(eventResult.events);
      })
      .catch((err) => setError(err.message));
  }, []);

  const eventId = eventFilter === "all" ? null : Number(eventFilter);
  const selectedEvent = events.find((event) => event.id === eventId) || null;

  const scoped = useMemo(
    () =>
      (sponsors || []).filter((s) => eventId === null || s.eventId === eventId),
    [sponsors, eventId],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return scoped
      .filter((sponsor) => {
        const matchesSearch =
          !term ||
          [
            sponsor.brandName,
            sponsor.industry,
            sponsor.contactName,
            sponsor.eventTitle,
          ].some((val) => (val || "").toLowerCase().includes(term));
        const matchesTier = tierFilter === "all" || sponsor.tier === tierFilter;
        const matchesPayment =
          paymentFilter === "all" || sponsor.paymentStatus === paymentFilter;
        return matchesSearch && matchesTier && matchesPayment;
      })
      .sort((a, b) => b.contractValue - a.contractValue);
  }, [scoped, search, tierFilter, paymentFilter]);

  const selectedSponsor = sponsors?.find((s) => s.id === selectedId) || null;
  const filtersActive =
    search ||
    eventFilter !== "all" ||
    tierFilter !== "all" ||
    paymentFilter !== "all";

  const replaceSponsor = (updated) =>
    setSponsors((list) => list.map((s) => (s.id === updated.id ? updated : s)));

  const clearFilters = () => {
    setSearch("");
    setEventFilter("all");
    setTierFilter("all");
    setPaymentFilter("all");
  };

  const openSponsorModal = (editing = null) =>
    setSponsorModal({ open: true, editing });
  const openDeliverableModal = (editing = null) =>
    setDeliverableModal({ open: true, editing });

  const handleSponsorSaved = (saved, mode) => {
    if (mode === "create") {
      setSponsors((list) => [saved, ...list]);
      setSelectedId(saved.id);
      toast.success(`${saved.brandName} onboarded successfully`);
    } else {
      replaceSponsor(saved);
      toast.success("Sponsor updated");
    }
  };

  const handleDeliverableSaved = (updated, mode) => {
    replaceSponsor(updated);
    toast.success(
      mode === "create" ? "Deliverable added" : "Deliverable updated",
    );
  };

  const changeStatus = async (deliverable, status) => {
    if (deliverable.status === status) return;
    setBusyId(deliverable.id);
    try {
      const updated = await sponsorService.setDeliverableStatus(
        selectedId,
        deliverable.id,
        status,
      );
      replaceSponsor(updated);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDownloadContract = (e, sponsor) => {
    e.stopPropagation();

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

    toast.success(`${sponsor.brandName} PDF downloaded`);
  };

  const confirmDeleteSponsor = async () => {
    setBusy(true);
    try {
      await sponsorService.remove(deletingSponsor.id);
      setSponsors((list) => list.filter((s) => s.id !== deletingSponsor.id));
      setSelectedId(null);
      toast.success(`${deletingSponsor.brandName} deleted`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      setDeletingSponsor(null);
    }
  };

  const confirmDeleteDeliverable = async () => {
    setBusy(true);
    try {
      const updated = await sponsorService.removeDeliverable(
        selectedId,
        deletingDeliverable.id,
      );
      replaceSponsor(updated);
      toast.success("Deliverable removed");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      setDeletingDeliverable(null);
    }
  };

  const closeSponsorModal = useCallback(
    () => setSponsorModal((curr) => ({ ...curr, open: false })),
    [],
  );
  const closeDeliverableModal = useCallback(
    () => setDeliverableModal((curr) => ({ ...curr, open: false })),
    [],
  );
  const closeDrawer = useCallback(() => setSelectedId(null), []);
  const closeDeleteSponsor = useCallback(() => setDeletingSponsor(null), []);
  const closeDeleteDeliverable = useCallback(
    () => setDeletingDeliverable(null),
    [],
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Sponsors & Partners"
        description="Brand sponsorships, payment collections and signed agreements."
        actions={
          <Button onClick={() => openSponsorModal()}>
            <Plus className="size-4" />
            Onboard sponsor
          </Button>
        }
      />

      {error && (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
          {error}
        </p>
      )}

      {!error && !sponsors && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, idx) => (
              <div
                key={idx}
                className="h-28 animate-pulse rounded-2xl bg-card"
              />
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, idx) => (
              <div
                key={idx}
                className="h-72 animate-pulse rounded-2xl bg-card"
              />
            ))}
          </div>
        </div>
      )}

      {sponsors && (
        <>
          <SponsorStats sponsors={scoped} />

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="relative block flex-1">
              <span className="sr-only">Search sponsors</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by brand name, industry or event"
                className="h-12 w-full rounded-xl border border-line bg-card pl-11 pr-4 text-sm outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[38rem]">
              <SelectField
                aria-label="Filter by event"
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                options={[
                  { value: "all", label: "All events" },
                  ...events.map((ev) => ({
                    value: String(ev.id),
                    label: ev.title,
                  })),
                ]}
              />
              <SelectField
                aria-label="Filter by tier"
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                options={[
                  { value: "all", label: "All tiers" },
                  ...toOptions(SPONSOR_TIERS),
                ]}
              />
              <SelectField
                aria-label="Filter by payment"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                options={[
                  { value: "all", label: "All payments" },
                  ...toOptions(PAYMENT_STATUS),
                ]}
              />
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={Handshake}
              title={filtersActive ? "No sponsors match" : "No sponsors yet"}
              text={
                filtersActive
                  ? "Try a different search or clear the filters."
                  : "Onboard the first brand to start tracking deals."
              }
              action={
                filtersActive ? (
                  <Button variant="ghost" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={() => openSponsorModal()}>
                    Onboard sponsor
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((sponsor) => {
                const tier = SPONSOR_TIERS[sponsor.tier] || {
                  label: sponsor.tier,
                  tone: "",
                };
                const payment = PAYMENT_STATUS[sponsor.paymentStatus] || {
                  label: sponsor.paymentStatus,
                  tone: "",
                };
                const stats = deliverableStats(sponsor);
                const receivedPercent = formatPercent(
                  sponsor.amountReceived,
                  sponsor.contractValue,
                );

                return (
                  <div
                    key={sponsor.id}
                    onClick={() => setSelectedId(sponsor.id)}
                    className="group relative flex flex-col justify-between rounded-2xl border border-line bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${tier.tone}`}
                        >
                          {tier.label}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${payment.tone}`}
                        >
                          {payment.label}
                        </span>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                          {sponsor.brandName}
                        </h3>
                        <p className="text-xs text-muted">{sponsor.industry}</p>
                      </div>

                      <div className="mt-3.5 rounded-xl border border-line/70 bg-elevated/60 p-2.5">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {sponsor.eventTitle}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted">
                          <CalendarDays className="size-3 text-muted/70" />
                          {formatDate(sponsor.eventDate)}
                        </p>
                      </div>

                      <div className="mt-4 border-t border-line/60 pt-3.5">
                        <div className="flex items-end justify-between">
                          <p className="text-base font-bold text-foreground">
                            {formatCurrency(sponsor.contractValue)}
                          </p>
                          <span className="text-[11px] text-muted">
                            Rec: {formatCurrency(sponsor.amountReceived)}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{
                              width: `${Math.min(receivedPercent, 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 border-t border-line/60 pt-3">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-medium text-muted">
                            Deliverables
                          </span>
                          <span className="font-semibold text-foreground">
                            {stats.done} / {stats.total} done
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              stats.percent === 100
                                ? "bg-emerald-500"
                                : "bg-primary"
                            }`}
                            style={{ width: `${stats.percent}%` }}
                          />
                        </div>
                        {stats.overdue > 0 && (
                          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                            <TriangleAlert className="size-3" />
                            {stats.overdue} tasks overdue
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className="mt-5 flex items-center justify-between gap-2 border-t border-line/60 pt-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleDownloadContract(e, sponsor)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-elevated px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary"
                      >
                        <Download className="size-3.5 text-primary" />
                        Download PDF
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openSponsorModal(sponsor)}
                          title="Edit"
                          className="grid size-8 place-items-center rounded-lg border border-line bg-elevated text-muted transition hover:border-primary hover:text-primary"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedId(sponsor.id)}
                          title="View Details"
                          className="grid size-8 place-items-center rounded-lg border border-line bg-elevated text-muted transition hover:border-primary hover:text-primary"
                        >
                          <ExternalLink className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <SponsorDrawer
        sponsor={selectedSponsor}
        canDelete={canDelete}
        busyId={busyId}
        onClose={closeDrawer}
        onEdit={openSponsorModal}
        onDelete={setDeletingSponsor}
        onAddDeliverable={() => openDeliverableModal()}
        onEditDeliverable={openDeliverableModal}
        onDeleteDeliverable={setDeletingDeliverable}
        onChangeStatus={changeStatus}
      />

      <SponsorFormModal
        open={sponsorModal.open}
        onClose={closeSponsorModal}
        editing={sponsorModal.editing}
        defaultEventId={eventId ? String(eventId) : ""}
        events={events}
        sponsors={sponsors || []}
        onSaved={handleSponsorSaved}
      />

      <DeliverableFormModal
        open={deliverableModal.open}
        onClose={closeDeliverableModal}
        sponsor={selectedSponsor}
        editing={deliverableModal.editing}
        onSaved={handleDeliverableSaved}
      />

      <ConfirmDialog
        open={Boolean(deletingDeliverable)}
        onClose={closeDeleteDeliverable}
        title="Remove this deliverable?"
        message={
          deletingDeliverable
            ? `"${deletingDeliverable.text}" will be removed.`
            : ""
        }
        confirmLabel="Remove"
        loading={busy}
        onConfirm={confirmDeleteDeliverable}
      />

      <ConfirmDialog
        open={Boolean(deletingSponsor)}
        onClose={closeDeleteSponsor}
        title="Delete this sponsor?"
        message={
          deletingSponsor
            ? `${deletingSponsor.brandName} will be removed from ${deletingSponsor.eventTitle}.`
            : ""
        }
        confirmLabel="Delete sponsor"
        loading={busy}
        onConfirm={confirmDeleteSponsor}
      />
    </div>
  );
};

export default SponsorsPage;
