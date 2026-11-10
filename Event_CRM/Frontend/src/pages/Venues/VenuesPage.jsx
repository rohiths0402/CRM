import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import { SelectField } from "../../components/common/FormControls";
import VenueStats from "../../components/venues/VenueStats";
import VenueCard from "../../components/venues/VenueCard";
import VenueDrawer from "../../components/venues/VenueDrawer";
import VenueFormModal from "../../components/venues/VenueFormModal";
import ZoneFormModal from "../../components/venues/ZoneFormModal";
import { useAuth } from "../../context/AuthContext";
import { eventService } from "../../api/services/eventService";
import { venueService } from "../../api/services/venueService";
import { STATE_NAMES } from "../../constants/indiaStates";
import { ROLES } from "../../constants/roles";
import { VENUE_TYPES } from "../../constants/venueOptions";

const VenuesPage = () => {
  const { user } = useAuth();
  const [venues, setVenues] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [stateSlug, setStateSlug] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [venueFormOpen, setVenueFormOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [zoneTarget, setZoneTarget] = useState(null);
  const [deletingVenue, setDeletingVenue] = useState(null);
  const [deletingZone, setDeletingZone] = useState(null);
  const [busy, setBusy] = useState(false);

  const canDelete = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role);

  useEffect(() => {
    Promise.all([venueService.list(), eventService.list()])
      .then(([venueResult, eventResult]) => {
        setVenues(venueResult.venues);
        setEvents(eventResult.events);
      })
      .catch((err) => setError(err.message));
  }, []);

  const stateOptions = useMemo(() => {
    const slugs = [...new Set((venues || []).map((venue) => venue.stateSlug))];
    return slugs.map((slug) => ({ value: slug, label: STATE_NAMES[slug] }));
  }, [venues]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (venues || []).filter((venue) => {
      const matchesSearch =
        !term ||
        [venue.name, venue.city, venue.address].some((value) =>
          value.toLowerCase().includes(term),
        );
      const matchesType = type === "all" || venue.type === type;
      const matchesState = stateSlug === "all" || venue.stateSlug === stateSlug;
      return matchesSearch && matchesType && matchesState;
    });
  }, [venues, search, type, stateSlug]);

  const selectedVenue =
    venues?.find((venue) => venue.id === selectedId) || null;

  const venueEvents = useMemo(
    () =>
      events
        .filter((event) => event.venueId === selectedId)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [events, selectedId],
  );

  const replaceVenue = (updated) =>
    setVenues((list) =>
      list.map((venue) => (venue.id === updated.id ? updated : venue)),
    );

  const openCreateVenue = () => {
    setEditingVenue(null);
    setVenueFormOpen(true);
  };

  const openEditVenue = (venue) => {
    setEditingVenue(venue);
    setVenueFormOpen(true);
  };

  const handleVenueSaved = (saved, mode) => {
    if (mode === "create") {
      setVenues((list) => [saved, ...list]);
      setSelectedId(saved.id);
      toast.success("Venue added. Now add its seating zones.");
    } else {
      replaceVenue(saved);
      toast.success("Venue updated");
      eventService.list().then((result) => setEvents(result.events));
    }
  };

  const handleZoneSaved = (updated, mode) => {
    replaceVenue(updated);
    toast.success(mode === "create" ? "Zone added" : "Zone updated");
  };

  const confirmDeleteZone = async () => {
    setBusy(true);
    try {
      const updated = await venueService.removeZone(
        selectedVenue.id,
        deletingZone.id,
      );
      replaceVenue(updated);
      toast.success(`${deletingZone.name} removed`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      setDeletingZone(null);
    }
  };

  const confirmDeleteVenue = async () => {
    setBusy(true);
    try {
      await venueService.remove(deletingVenue.id);
      setVenues((list) =>
        list.filter((venue) => venue.id !== deletingVenue.id),
      );
      setSelectedId(null);
      toast.success(`${deletingVenue.name} deleted`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      setDeletingVenue(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setType("all");
    setStateSlug("all");
  };

  const closeVenueForm = useCallback(() => setVenueFormOpen(false), []);
  const closeZoneForm = useCallback(() => setZoneTarget(null), []);
  const closeDrawer = useCallback(() => setSelectedId(null), []);
  const closeDeleteVenue = useCallback(() => setDeletingVenue(null), []);
  const closeDeleteZone = useCallback(() => setDeletingZone(null), []);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Venues & Seating"
        description="Every venue you can book, with its seating zones, safety clearance and Fire NOC status."
        actions={
          <Button onClick={openCreateVenue}>
            <Plus className="size-4" />
            Add venue
          </Button>
        }
      />

      {error && (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
          {error}
        </p>
      )}

      {!error && !venues && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-3xl bg-card"
              />
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="h-96 animate-pulse rounded-3xl bg-card"
              />
            ))}
          </div>
        </div>
      )}

      {venues && (
        <>
          <VenueStats venues={venues} />

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="relative block flex-1">
              <span className="sr-only">Search venues</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by venue, city or address"
                className="h-12 w-full rounded-xl border border-line bg-card pl-11 pr-4 text-sm outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </label>

            <div className="grid grid-cols-2 gap-3 lg:w-96">
              <SelectField
                aria-label="Filter by type"
                value={type}
                onChange={(event) => setType(event.target.value)}
                options={[
                  { value: "all", label: "All types" },
                  ...VENUE_TYPES.map((item) => ({ value: item, label: item })),
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
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No venues match"
              text="Try a different search or clear the filters to see every venue."
              action={
                <Button variant="ghost" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  onOpen={setSelectedId}
                />
              ))}
            </div>
          )}
        </>
      )}

      <VenueDrawer
        venue={selectedVenue}
        events={venueEvents}
        canDelete={canDelete}
        onClose={closeDrawer}
        onEditVenue={openEditVenue}
        onDeleteVenue={setDeletingVenue}
        onAddZone={() => setZoneTarget({ zone: null })}
        onEditZone={(zone) => setZoneTarget({ zone })}
        onDeleteZone={setDeletingZone}
      />

      <VenueFormModal
        open={venueFormOpen}
        onClose={closeVenueForm}
        editing={editingVenue}
        venues={venues || []}
        events={events}
        onSaved={handleVenueSaved}
      />

      <ZoneFormModal
        open={Boolean(zoneTarget)}
        onClose={closeZoneForm}
        venue={selectedVenue}
        editing={zoneTarget?.zone || null}
        onSaved={handleZoneSaved}
      />

      <ConfirmDialog
        open={Boolean(deletingZone)}
        onClose={closeDeleteZone}
        title="Remove this zone?"
        message={
          deletingZone
            ? `${deletingZone.name} will be removed and its seats go back to the unallocated pool.`
            : ""
        }
        confirmLabel="Remove zone"
        loading={busy}
        onConfirm={confirmDeleteZone}
      />

      <ConfirmDialog
        open={Boolean(deletingVenue)}
        onClose={closeDeleteVenue}
        title="Delete this venue?"
        message={
          deletingVenue
            ? `${deletingVenue.name} and all its seating zones will be removed from Venue Master. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete venue"
        loading={busy}
        onConfirm={confirmDeleteVenue}
      />
    </div>
  );
};

export default VenuesPage;
