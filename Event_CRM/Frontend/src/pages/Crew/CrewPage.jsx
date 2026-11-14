import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/common/PageHeader";
import { SelectField, TextField } from "../../components/common/FormControls";
import { eventService } from "../../api/services/eventService";
import { workspaceService } from "../../api/services/workspaceService";

const CREW_STATUSES = [
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PENDING", label: "Pending" },
  { value: "UNAVAILABLE", label: "Unavailable" },
];

const statusStyles = {
  CONFIRMED: "bg-emerald-500/10 text-emerald-600",
  PENDING: "bg-amber-500/10 text-amber-600",
  UNAVAILABLE: "bg-rose-500/10 text-rose-600",
};

const BLANK_MEMBER = {
  name: "",
  email: "",
  phone: "",
  position: "",
  department: "Production",
  eventId: "",
  shift: "",
  status: "PENDING",
};

const CrewModal = ({ open, onClose, events, editing, onSave }) => {
  const [form, setForm] = useState(() => editing ? { ...editing, eventId: String(editing.eventId) } : {
    ...BLANK_MEMBER,
    eventId: events[0]?.id?.toString() || "",
  });
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const saved = await onSave({ ...form, eventId: Number(form.eventId) });
      if (saved) onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit crew member" : "Add crew member"}
      subtitle="Keep contact details, event assignment, and shift information current."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="crew-form" loading={busy}>{editing ? "Save changes" : "Add to crew"}</Button>
        </>
      }
    >
      <form id="crew-form" onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Full name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Crew member name" />
          <TextField label="Job title" required value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} placeholder="e.g. Stage manager" />
          <TextField label="Email" required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@company.com" />
          <TextField label="Phone" required type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Mobile number" />
          <SelectField label="Department" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} options={["Production", "Stage", "Guest Experience", "Security", "Ticketing", "Medical", "Marketing", "Operations", "Other"].map((item) => ({ value: item, label: item }))} />
          <SelectField label="Assigned event" required value={form.eventId} onChange={(event) => setForm({ ...form, eventId: event.target.value })} options={events.map((item) => ({ value: item.id.toString(), label: item.title }))} />
          <TextField label="Shift" required value={form.shift} onChange={(event) => setForm({ ...form, shift: event.target.value })} placeholder="e.g. 02:00 PM – 11:00 PM" />
          <SelectField label="Availability" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} options={CREW_STATUSES} />
        </div>
      </form>
    </Modal>
  );
};

const CrewPage = () => {
  const [crew, setCrew] = useState(null);
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    Promise.all([workspaceService.listCrew(), eventService.list()])
      .then(([crewResult, eventResult]) => {
        setCrew(crewResult);
        setEvents(eventResult.events);
      })
      .catch((err) => setError(err.message));
  }, []);

  const eventName = useCallback(
    (id) => events?.find((event) => event.id === id)?.title || "Unassigned",
    [events],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (crew || []).filter((member) => {
      const eventTitle = eventName(member.eventId);
      const matchesSearch = !term || [
        member.name,
        member.email,
        member.position,
        member.department,
        eventTitle,
      ].some((value) => value?.toLowerCase().includes(term));
      return matchesSearch &&
        (statusFilter === "all" || member.status === statusFilter) &&
        (eventFilter === "all" || member.eventId === Number(eventFilter));
    });
  }, [crew, eventName, search, statusFilter, eventFilter]);

  const summary = useMemo(() => [
    { label: "Team members", value: crew?.length || 0, icon: Users, tone: "text-primary" },
    { label: "Confirmed", value: (crew || []).filter((item) => item.status === "CONFIRMED").length, icon: CheckCircle2, tone: "text-emerald-500" },
    { label: "Awaiting confirmation", value: (crew || []).filter((item) => item.status === "PENDING").length, icon: Clock3, tone: "text-amber-500" },
    { label: "Events staffed", value: new Set((crew || []).filter((item) => item.status !== "UNAVAILABLE").map((item) => item.eventId)).size, icon: CalendarDays, tone: "text-sky-500" },
  ], [crew]);

  const saveMember = async (member) => {
    try {
      const saved = await workspaceService.saveCrewMember(member);
      setCrew((items) => member.id
        ? items.map((item) => item.id === saved.id ? saved : item)
        : [saved, ...items]);
      toast.success(member.id ? "Crew details updated" : "Crew member added");
      setEditing(null);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  const updateStatus = async (member, status) => {
    try {
      const updated = await workspaceService.saveCrewMember({ ...member, status });
      setCrew((items) => items.map((item) => item.id === updated.id ? updated : item));
      toast.success(`${member.name} marked ${CREW_STATUSES.find((item) => item.value === status).label.toLowerCase()}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeMember = async () => {
    try {
      await workspaceService.removeCrewMember(deleting.id);
      setCrew((items) => items.filter((item) => item.id !== deleting.id));
      toast.success(`${deleting.name} removed from the crew`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setEditing(member);
    setModalOpen(true);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setEventFilter("all");
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Crew & Staff"
        description="Coordinate event assignments, shifts, and confirmations for your on-site team."
        actions={<Button onClick={openCreate} disabled={!events?.length}><Plus className="size-4" />Add crew member</Button>}
      />

      {error && <p role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-3xl border border-line bg-card p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-elevated"><Icon className={`size-5 ${tone}`} /></span>
            <p className="mt-4 text-sm text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_220px_240px]">
        <label className="relative block">
          <span className="sr-only">Search crew</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, role, department or event" className="h-12 w-full rounded-xl border border-line bg-card pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
        </label>
        <SelectField aria-label="Filter crew by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} options={[{ value: "all", label: "All availability" }, ...CREW_STATUSES]} />
        <SelectField aria-label="Filter crew by event" value={eventFilter} onChange={(event) => setEventFilter(event.target.value)} options={[{ value: "all", label: "All events" }, ...(events || []).map((event) => ({ value: event.id.toString(), label: event.title }))]} />
      </div>

      {!crew && !error && <div className="h-80 animate-pulse rounded-3xl bg-card" />}
      {crew && visible.length === 0 && <EmptyState icon={Users} title="No crew members found" text="Try another search or add your first team member." action={<Button variant="ghost" onClick={clearFilters}>Clear filters</Button>} />}
      {crew && visible.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-line bg-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-4"><div><h2 className="font-semibold">Team roster</h2><p className="mt-1 text-xs text-muted">{visible.length} team members</p></div><ShieldCheck className="size-5 text-muted" /></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-elevated text-xs uppercase tracking-wide text-muted"><tr>{["Team member", "Department", "Event assignment", "Shift", "Availability", "Actions"].map((heading) => <th key={heading} className="px-5 py-3 font-semibold">{heading}</th>)}</tr></thead>
              <tbody className="divide-y divide-line/70">
                {visible.map((member) => (
                  <tr key={member.id} className="hover:bg-elevated/60">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{member.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span><div><p className="font-semibold">{member.name}</p><p className="mt-1 text-xs text-muted">{member.position}</p><a href={`mailto:${member.email}`} className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"><Mail className="size-3" />{member.email}</a><p className="mt-1 text-xs text-muted">{member.phone}</p></div></div></td>
                    <td className="px-5 py-4"><span className="rounded-full bg-elevated px-3 py-1 text-xs font-medium">{member.department}</span></td>
                    <td className="max-w-56 px-5 py-4"><p className="truncate font-medium">{eventName(member.eventId)}</p><p className="mt-1 text-xs text-muted">{events?.find((event) => event.id === member.eventId)?.city}</p></td>
                    <td className="whitespace-nowrap px-5 py-4">{member.shift}</td>
                    <td className="px-5 py-4"><select aria-label={`Update availability for ${member.name}`} value={member.status} onChange={(event) => updateStatus(member, event.target.value)} className={`h-9 rounded-full border-0 px-3 text-xs font-semibold outline-none ${statusStyles[member.status]}`}>{CREW_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></td>
                    <td className="px-5 py-4"><div className="flex items-center gap-2"><button type="button" onClick={() => openEdit(member)} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold hover:border-primary hover:text-primary">Edit</button><button type="button" onClick={() => setDeleting(member)} aria-label={`Remove ${member.name}`} className="grid size-9 place-items-center rounded-lg border border-line text-muted transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-500"><Trash2 className="size-4" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-line bg-elevated p-4 text-sm text-muted"><CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" /><p>Use availability to track confirmations before event day. Roster changes are saved in this browser.</p></div>

      <CrewModal key={`${modalOpen}-${editing?.id || "new"}`} open={modalOpen} onClose={() => setModalOpen(false)} events={events || []} editing={editing} onSave={saveMember} />
      <ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Remove this crew member?" message={deleting ? `${deleting.name} will be removed from the event roster.` : ""} confirmLabel="Remove member" onConfirm={removeMember} />
    </div>
  );
};

export default CrewPage;
