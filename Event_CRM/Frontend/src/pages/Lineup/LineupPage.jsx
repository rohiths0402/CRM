import { useCallback, useEffect, useMemo, useState } from "react";
import { LockKeyhole, Mic2, Plus } from "lucide-react";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import { SelectField } from "../../components/common/FormControls";
import EventStrip from "../../components/lineup/EventStrip";
import LineupStats from "../../components/lineup/LineupStats";
import AttentionChips from "../../components/lineup/AttentionChips";
import StageTimeline from "../../components/lineup/StageTimeline";
import RiderTracker from "../../components/lineup/RiderTracker";
import ArtistDrawer from "../../components/lineup/ArtistDrawer";
import SlotFormModal from "../../components/lineup/SlotFormModal";
import RiderFormModal from "../../components/lineup/RiderFormModal";
import RiderItemFormModal from "../../components/lineup/RiderItemFormModal";
import {
  attentionCounts,
  slotIssues,
} from "../../components/lineup/lineupHelpers";
import { useAuth } from "../../context/AuthContext";
import { eventService } from "../../api/services/eventService";
import { lineupService } from "../../api/services/lineupService";
import { venueService } from "../../api/services/venueService";
import { ROLES } from "../../constants/roles";
import { formatDate } from "../../utils/format";

const LineupPage = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState(null);
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState("");
  const [eventId, setEventId] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [slotModal, setSlotModal] = useState({ open: false, editing: null });
  const [riderOpen, setRiderOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const canDelete = user.role === ROLES.ADMIN;

  useEffect(() => {
    Promise.all([
      lineupService.list(),
      eventService.list(),
      venueService.list(),
    ])
      .then(([lineupResult, eventResult, venueResult]) => {
        setSlots(lineupResult.slots);
        setEvents(eventResult.events);
        setVenues(venueResult.venues);
        const withActs = eventResult.events.find((event) =>
          lineupResult.slots.some((slot) => slot.eventId === event.id),
        );
        setEventId(String((withActs || eventResult.events[0])?.id || ""));
      })
      .catch((err) => setError(err.message));
  }, []);

  const event = events.find((item) => String(item.id) === eventId) || null;
  const venue = venues.find((item) => item.id === event?.venueId) || null;
  const locked = event?.status === "WRAP";

  const eventSlots = useMemo(
    () => (slots || []).filter((slot) => slot.eventId === event?.id),
    [slots, event],
  );

  const context = useMemo(
    () => ({ event, venue, slots: eventSlots }),
    [event, venue, eventSlots],
  );

  const conflictIds = useMemo(() => {
    if (!event) return new Set();
    return new Set(
      eventSlots
        .filter((slot) => slotIssues(slot, context).length > 0)
        .map((slot) => slot.id),
    );
  }, [eventSlots, context, event]);

  const counts = useMemo(
    () => (event ? attentionCounts(eventSlots, context) : null),
    [eventSlots, context, event],
  );

  const activeSlots = eventSlots.filter((slot) => slot.status !== "CANCELLED");
  const selectedSlot =
    eventSlots.find((slot) => slot.id === selectedId) || null;
  const selectedIssues = selectedSlot ? slotIssues(selectedSlot, context) : [];

  const replaceSlot = (updated) =>
    setSlots((list) =>
      list.map((slot) => (slot.id === updated.id ? updated : slot)),
    );

  const changeEvent = (change) => {
    setEventId(change.target.value);
    setSelectedId(null);
  };

  const openSlotModal = (editing = null) =>
    setSlotModal({ open: true, editing });

  const handleSlotSaved = (saved, mode) => {
    if (mode === "create") {
      setSlots((list) => [...list, saved]);
      setSelectedId(saved.id);
      toast.success(`${saved.artistName} added to the lineup`);
    } else {
      replaceSlot(saved);
      toast.success("Lineup slot updated");
    }
  };

  const handleRiderSaved = (updated) => {
    replaceSlot(updated);
    toast.success("Rider updated");
  };

  const handleItemAdded = (updated) => {
    replaceSlot(updated);
    toast.success("Rider item added");
  };

  const changeItemStatus = async (item, status) => {
    if (item.status === status) return;
    setBusyId(item.id);
    try {
      replaceSlot(
        await lineupService.setRiderItemStatus(selectedId, item.id, status),
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDeleteItem = async () => {
    setBusy(true);
    try {
      replaceSlot(
        await lineupService.removeRiderItem(selectedId, deletingItem.id),
      );
      toast.success("Rider item removed");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      setDeletingItem(null);
    }
  };

  const confirmDeleteSlot = async () => {
    setBusy(true);
    try {
      await lineupService.remove(deletingSlot.id);
      setSlots((list) => list.filter((slot) => slot.id !== deletingSlot.id));
      setSelectedId(null);
      toast.success(`${deletingSlot.artistName} removed from the lineup`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      setDeletingSlot(null);
    }
  };

  const closeSlotModal = useCallback(
    () => setSlotModal((current) => ({ ...current, open: false })),
    [],
  );
  const closeRider = useCallback(() => setRiderOpen(false), []);
  const closeItem = useCallback(() => setItemOpen(false), []);
  const closeDrawer = useCallback(() => setSelectedId(null), []);
  const closeDeleteSlot = useCallback(() => setDeletingSlot(null), []);
  const closeDeleteItem = useCallback(() => setDeletingItem(null), []);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Artist Lineup & Riders"
        description="The hour by hour stage plan, plus everything each artist needs backstage."
        actions={
          event && (
            <Button disabled={locked} onClick={() => openSlotModal()}>
              <Plus className="size-4" />
              Add slot
            </Button>
          )
        }
      />

      {error && (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
          {error}
        </p>
      )}

      {!error && !slots && (
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-3xl bg-card" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-3xl bg-card"
              />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-3xl bg-card" />
        </div>
      )}

      {slots && !event && (
        <EmptyState
          icon={Mic2}
          title="No events yet"
          text="Create an event in Events Master first, then plan its lineup here."
        />
      )}

      {slots && event && (
        <>
          <div className="sm:max-w-xl">
            <SelectField
              label="Event"
              value={eventId}
              onChange={changeEvent}
              options={events.map((item) => ({
                value: String(item.id),
                label: `${item.title} · ${formatDate(item.date)}`,
              }))}
            />
          </div>

          <EventStrip
            event={event}
            venue={venue}
            actCount={activeSlots.length}
          />

          {locked && (
            <p className="flex items-center gap-2 rounded-2xl border border-line bg-card px-4 py-3 text-sm text-muted">
              <LockKeyhole className="size-4 shrink-0 text-primary" />
              This event is wrapped, so its lineup is locked.
            </p>
          )}

          {activeSlots.length === 0 && eventSlots.length === 0 ? (
            <EmptyState
              icon={Mic2}
              title="No acts planned yet"
              text="Add the opening act, the headliner and everything in between to build the stage plan."
              action={
                !locked && (
                  <Button onClick={() => openSlotModal()}>
                    <Plus className="size-4" />
                    Add the first slot
                  </Button>
                )
              }
            />
          ) : (
            <>
              <LineupStats slots={eventSlots} event={event} />
              <AttentionChips counts={counts} />

              <section className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold">Stage timeline</h3>
                  <p className="mt-1 text-sm text-muted">
                    Every act on its stage, hour by hour. Scroll sideways to see
                    the whole night.
                  </p>
                </div>
                {activeSlots.length > 0 ? (
                  <StageTimeline
                    event={event}
                    slots={eventSlots}
                    selectedId={selectedId}
                    conflictIds={conflictIds}
                    onSelect={setSelectedId}
                  />
                ) : (
                  <p className="rounded-3xl border border-dashed border-line bg-card px-6 py-10 text-center text-sm text-muted">
                    Every act of this event is cancelled, so there is nothing to
                    show on the timeline.
                  </p>
                )}
              </section>

              <section className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold">
                    Rider and hospitality tracker
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    Manager contacts, green rooms and special requests for every
                    artist. Click a row for the full checklist.
                  </p>
                </div>
                <RiderTracker
                  event={event}
                  slots={eventSlots}
                  selectedId={selectedId}
                  onOpen={setSelectedId}
                />
              </section>
            </>
          )}
        </>
      )}

      <ArtistDrawer
        slot={selectedSlot}
        event={event}
        issues={selectedIssues}
        canDelete={canDelete}
        locked={Boolean(locked)}
        busyId={busyId}
        onClose={closeDrawer}
        onEditSlot={openSlotModal}
        onDelete={setDeletingSlot}
        onEditRider={() => setRiderOpen(true)}
        onAddItem={() => setItemOpen(true)}
        onDeleteItem={setDeletingItem}
        onChangeItemStatus={changeItemStatus}
      />

      <SlotFormModal
        open={slotModal.open}
        onClose={closeSlotModal}
        editing={slotModal.editing}
        event={event}
        venue={venue}
        slots={slots || []}
        onSaved={handleSlotSaved}
      />

      <RiderFormModal
        open={riderOpen}
        onClose={closeRider}
        slot={selectedSlot}
        onSaved={handleRiderSaved}
      />

      <RiderItemFormModal
        open={itemOpen}
        onClose={closeItem}
        slot={selectedSlot}
        onSaved={handleItemAdded}
      />

      <ConfirmDialog
        open={Boolean(deletingItem)}
        onClose={closeDeleteItem}
        title="Remove this rider item?"
        message={
          deletingItem
            ? `"${deletingItem.label}" will be removed from the rider checklist.`
            : ""
        }
        confirmLabel="Remove"
        loading={busy}
        onConfirm={confirmDeleteItem}
      />

      <ConfirmDialog
        open={Boolean(deletingSlot)}
        onClose={closeDeleteSlot}
        title="Delete this slot?"
        message={
          deletingSlot
            ? `${deletingSlot.artistName} and the rider checklist will be removed from the lineup. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete slot"
        loading={busy}
        onConfirm={confirmDeleteSlot}
      />
    </div>
  );
};

export default LineupPage;
