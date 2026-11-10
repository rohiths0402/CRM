import { useCallback, useEffect, useMemo, useState } from "react";
import { Columns3, Plus, Search, Table2, CalendarX } from "lucide-react";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import { SelectField } from "../../components/common/FormControls";
import EventStats from "../../components/events/EventStats";
import EventKanban from "../../components/events/EventKanban";
import EventTable from "../../components/events/EventTable";
import EventDrawer from "../../components/events/EventDrawer";
import EventFormModal from "../../components/events/EventFormModal";
import { useAuth } from "../../context/AuthContext";
import { eventService } from "../../api/services/eventService";
import { venueService } from "../../api/services/venueService";
import { EVENT_CATEGORIES } from "../../constants/eventOptions";
import { EVENT_STATUS } from "../../constants/eventStatus";
import { STATE_NAMES } from "../../constants/indiaStates";
import { ROLES } from "../../constants/roles";

const views = [
  { key: "board", label: "Board", icon: Columns3 },
  { key: "table", label: "Table", icon: Table2 },
];

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState(null);
  const [venues, setVenues] = useState(null);
  const [error, setError] = useState("");
  const [view, setView] = useState("board");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stateSlug, setStateSlug] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

const canDelete = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role);

  useEffect(() => {
    Promise.all([eventService.list(), venueService.list()])
      .then(([eventResult, venueResult]) => {
        setEvents(eventResult.events);
        setVenues(venueResult.venues);
      })
      .catch((err) => setError(err.message));
  }, []);

  const stateOptions = useMemo(() => {
    const slugs = [...new Set((events || []).map((event) => event.stateSlug))];
    return slugs.map((slug) => ({ value: slug, label: STATE_NAMES[slug] }));
  }, [events]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (events || []).filter((event) => {
      const matchesSearch =
        !term ||
        [event.title, event.city, event.venue, event.headliner].some((value) =>
          (value || "").toLowerCase().includes(term),
        );
      const matchesCategory = category === "all" || event.category === category;
      const matchesState = stateSlug === "all" || event.stateSlug === stateSlug;
      return matchesSearch && matchesCategory && matchesState;
    });
  }, [events, search, category, stateSlug]);

  const selectedEvent =
    events?.find((event) => event.id === selectedId) || null;

  const changeStatus = useCallback(
    async (event, status) => {
      if (event.status === status) return;
      if (status === "SOLD_OUT" && event.ticketsSold < event.capacity) {
        toast.error("Only fully booked events can be marked as sold out");
        return;
      }

      const previous = events;
      setEvents((list) =>
        list.map((item) => (item.id === event.id ? { ...item, status } : item)),
      );

      try {
        await eventService.updateStatus(event.id, status);
        toast.success(`${event.title} moved to ${EVENT_STATUS[status].label}`);
      } catch (err) {
        setEvents(previous);
        toast.error(err.message);
      }
    },
    [events],
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (event) => {
    setEditing(event);
    setFormOpen(true);
  };

  const handleSaved = (saved, mode) => {
    if (mode === "create") {
      setEvents((list) => [saved, ...list]);
      setSelectedId(saved.id);
      toast.success("Event created as a draft");
    } else {
      setEvents((list) =>
        list.map((item) => (item.id === saved.id ? saved : item)),
      );
      toast.success("Event updated");
    }
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await eventService.remove(deleting.id);
      setEvents((list) => list.filter((item) => item.id !== deleting.id));
      setSelectedId(null);
      toast.success(`${deleting.title} deleted`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteBusy(false);
      setDeleting(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setStateSlug("all");
  };

  const closeForm = useCallback(() => setFormOpen(false), []);
  const closeDrawer = useCallback(() => setSelectedId(null), []);
  const closeConfirm = useCallback(() => setDeleting(null), []);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Events Master"
        description="Every event from first draft to final wrap. Drag a card to move it to the next stage."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Create event
          </Button>
        }
      />

      {error && (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
          {error}
        </p>
      )}

      {!error && !events && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-3xl bg-card"
              />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-3xl bg-card" />
        </div>
      )}

      {events && (
        <>
          <EventStats events={events} />

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="relative block flex-1">
              <span className="sr-only">Search events</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by event, city, venue or headliner"
                className="h-12 w-full rounded-xl border border-line bg-card pl-11 pr-4 text-sm outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </label>

            <div className="grid grid-cols-2 gap-3 lg:w-96">
              <SelectField
                aria-label="Filter by category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                options={[
                  { value: "all", label: "All categories" },
                  ...EVENT_CATEGORIES.map((item) => ({
                    value: item,
                    label: item,
                  })),
                ]}
              />
              <SelectField
                aria-label="Filter by state"
                value={stateSlug}
                onChange={(event) => setStateSlug(event.target.value)}
                options={[
                  { value: "all", label: "All states" },
                  ...stateOptions,
                ]}
              />
            </div>

            <div className="flex h-12 shrink-0 rounded-xl border border-line bg-card p-1">
              {views.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition ${
                    view === key
                      ? "bg-elevated text-primary shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={CalendarX}
              title="No events match"
              text="Try a different search or clear the filters to see every event."
              action={
                <Button variant="ghost" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : view === "board" ? (
            <EventKanban
              events={filtered}
              onOpen={setSelectedId}
              onMove={changeStatus}
            />
          ) : (
            <EventTable events={filtered} onOpen={setSelectedId} />
          )}
        </>
      )}

      <EventDrawer
        event={selectedEvent}
        canDelete={canDelete}
        onClose={closeDrawer}
        onStatusChange={changeStatus}
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      <EventFormModal
        open={formOpen}
        onClose={closeForm}
        editing={editing}
        events={events || []}
        venues={venues}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={closeConfirm}
        title="Delete this event?"
        message={
          deleting
            ? `${deleting.title} will be removed from Events Master and from the dashboard map. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete event"
        loading={deleteBusy}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default EventsPage;
