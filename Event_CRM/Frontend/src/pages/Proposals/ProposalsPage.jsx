import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleDollarSign,
  Inbox,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/common/PageHeader";
import { SelectField, TextAreaField, TextField } from "../../components/common/FormControls";
import { workspaceService } from "../../api/services/workspaceService";

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "IN_REVIEW", label: "In review" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "DECLINED", label: "Declined" },
];

const STATUS_STYLE = {
  NEW: "bg-sky-500/10 text-sky-600",
  IN_REVIEW: "bg-amber-500/10 text-amber-600",
  SHORTLISTED: "bg-emerald-500/10 text-emerald-600",
  DECLINED: "bg-rose-500/10 text-rose-600",
};

const EMPTY_FORM = {
  company: "",
  contactName: "",
  email: "",
  eventTitle: "",
  eventType: "Concert",
  city: "",
  eventDate: "",
  attendees: "",
  budget: "",
  notes: "",
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const ProposalModal = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const saved = await onSave({
        ...form,
        attendees: Number(form.attendees),
        budget: Number(form.budget),
      });
      if (saved) onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add inbound proposal"
      subtitle="Capture the organizer and event details to start the review."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="proposal-form" loading={busy}>
            Add proposal
          </Button>
        </>
      }
    >
      <form id="proposal-form" onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Organization" required value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} placeholder="Company or organizer" />
          <TextField label="Contact person" required value={form.contactName} onChange={(event) => setForm({ ...form, contactName: event.target.value })} placeholder="Full name" />
          <TextField label="Contact email" required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@company.com" />
          <TextField label="Event title" required value={form.eventTitle} onChange={(event) => setForm({ ...form, eventTitle: event.target.value })} placeholder="Proposed event name" />
          <SelectField label="Event type" value={form.eventType} onChange={(event) => setForm({ ...form, eventType: event.target.value })} options={["Concert", "Film launch", "Conference", "Stand-up", "Festival", "Other"].map((item) => ({ value: item, label: item }))} />
          <TextField label="City" required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Event city" />
          <TextField label="Proposed date" required type="date" value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} />
          <TextField label="Expected attendees" required type="number" min="1" value={form.attendees} onChange={(event) => setForm({ ...form, attendees: event.target.value })} placeholder="e.g. 2500" />
          <TextField label="Estimated budget" required type="number" min="1" value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} placeholder="INR" />
        </div>
        <TextAreaField label="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Requirements, venue preference, or other context" />
      </form>
    </Modal>
  );
};

const ProposalsPage = () => {
  const [proposals, setProposals] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    workspaceService.listProposals()
      .then(setProposals)
      .catch((err) => setError(err.message));
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (proposals || []).filter((proposal) => {
      const matchesSearch = !term || [
        proposal.company,
        proposal.contactName,
        proposal.eventTitle,
        proposal.city,
      ].some((value) => value?.toLowerCase().includes(term));
      return matchesSearch && (statusFilter === "all" || proposal.status === statusFilter);
    });
  }, [proposals, search, statusFilter]);

  const stats = useMemo(() => {
    const all = proposals || [];
    return [
      { label: "Total proposals", value: all.length, icon: Inbox, color: "text-primary" },
      { label: "Needs review", value: all.filter((item) => ["NEW", "IN_REVIEW"].includes(item.status)).length, icon: CalendarDays, color: "text-amber-500" },
      { label: "Shortlisted", value: all.filter((item) => item.status === "SHORTLISTED").length, icon: Check, color: "text-emerald-500" },
      { label: "Pipeline value", value: money(all.filter((item) => item.status !== "DECLINED").reduce((sum, item) => sum + Number(item.budget), 0)), icon: CircleDollarSign, color: "text-sky-500" },
    ];
  }, [proposals]);

  const saveProposal = async (proposal) => {
    try {
      const saved = await workspaceService.saveProposal(proposal);
      setProposals((items) => [saved, ...items]);
      toast.success("Proposal added to your inbox");
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  const updateStatus = async (proposal, status) => {
    try {
      const updated = await workspaceService.updateProposalStatus(proposal.id, status);
      setProposals((items) => items.map((item) => item.id === updated.id ? updated : item));
      toast.success(`Proposal marked ${STATUS_OPTIONS.find((item) => item.value === status).label.toLowerCase()}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Inbound Proposals"
        description="Review event enquiries, track the pipeline, and keep every organizer follow-up in one place."
        actions={<Button onClick={() => setModalOpen(true)}><Plus className="size-4" />Add proposal</Button>}
      />

      {error && <p role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-3xl border border-line bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-elevated"><Icon className={`size-5 ${color}`} /></span>
              <ArrowUpRight className="size-4 text-muted" />
            </div>
            <p className="mt-4 text-sm text-muted">{label}</p>
            <p className="mt-1 truncate text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative block flex-1">
          <span className="sr-only">Search proposals</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search organizer, event, contact or city" className="h-12 w-full rounded-xl border border-line bg-card pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
        </label>
        <SelectField aria-label="Filter by proposal status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} options={[{ value: "all", label: "All statuses" }, ...STATUS_OPTIONS]} />
      </div>

      {!proposals && !error && <div className="h-80 animate-pulse rounded-3xl bg-card" />}
      {proposals && visible.length === 0 && (
        <EmptyState icon={Users} title="No proposals found" text="Try changing your search or filters, or add a new inbound proposal." action={<Button variant="ghost" onClick={clearFilters}>Clear filters</Button>} />
      )}
      {proposals && visible.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-line bg-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div><h3 className="font-semibold">Proposal pipeline</h3><p className="mt-1 text-xs text-muted">{visible.length} {visible.length === 1 ? "proposal" : "proposals"}</p></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-elevated text-xs uppercase tracking-wide text-muted">
                <tr>{["Event & organizer", "Event date", "City", "Expected guests", "Budget", "Status", "Update status"].map((heading) => <th key={heading} className="px-5 py-3 font-semibold">{heading}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {visible.map((proposal) => (
                  <tr key={proposal.id} className="align-top transition hover:bg-elevated/60">
                    <td className="px-5 py-4"><p className="font-semibold">{proposal.eventTitle}</p><p className="mt-1 text-xs text-muted">{proposal.company} · {proposal.contactName}</p><p className="mt-1 text-xs text-muted">{proposal.email}</p></td>
                    <td className="whitespace-nowrap px-5 py-4">{new Date(`${proposal.eventDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}<p className="mt-1 text-xs text-muted">Received {new Date(`${proposal.receivedAt}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p></td>
                    <td className="px-5 py-4">{proposal.city}<p className="mt-1 text-xs text-muted">{proposal.eventType}</p></td>
                    <td className="px-5 py-4"><span className="inline-flex items-center gap-1.5"><Users className="size-3.5 text-muted" />{Number(proposal.attendees).toLocaleString("en-IN")}</span></td>
                    <td className="whitespace-nowrap px-5 py-4 font-medium">{money(Number(proposal.budget))}</td>
                    <td className="px-5 py-4"><span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[proposal.status]}`}>{STATUS_OPTIONS.find((item) => item.value === proposal.status)?.label}</span>{proposal.notes && <p className="mt-2 max-w-48 text-xs text-muted">{proposal.notes}</p>}</td>
                    <td className="px-5 py-4"><select aria-label={`Update status for ${proposal.eventTitle}`} value={proposal.status} onChange={(event) => updateStatus(proposal, event.target.value)} className="h-10 rounded-xl border border-line bg-elevated px-3 text-xs outline-none focus:border-primary">{STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-line bg-elevated p-4 text-sm text-muted">
        <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>Keep proposed dates and budgets current as conversations progress. Status changes and new proposals are saved in this browser.</p>
      </div>

      <ProposalModal key={modalOpen ? "open" : "closed"} open={modalOpen} onClose={() => setModalOpen(false)} onSave={saveProposal} />
    </div>
  );
};

export default ProposalsPage;
