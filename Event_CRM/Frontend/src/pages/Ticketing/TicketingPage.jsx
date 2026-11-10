import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgePercent, Plus, Search, Ticket } from "lucide-react";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import { SelectField } from "../../components/common/FormControls";
import TicketingStats from "../../components/ticketing/TicketingStats";
import SeatReleaseCard from "../../components/ticketing/SeatReleaseCard";
import TierTable from "../../components/ticketing/TierTable";
import PromoTable from "../../components/ticketing/PromoTable";
import TierFormModal from "../../components/ticketing/TierFormModal";
import PromoFormModal from "../../components/ticketing/PromoFormModal";
import { promoState } from "../../components/ticketing/ticketingHelpers";
import { useAuth } from "../../context/AuthContext";
import { eventService } from "../../api/services/eventService";
import { ticketService } from "../../api/services/ticketService";
import { PROMO_STATE, TIER_STATUS } from "../../constants/ticketing";
import { ROLES } from "../../constants/roles";

const tabs = [
  { key: "tiers", label: "Ticket tiers", icon: Ticket },
  { key: "promos", label: "Promo codes", icon: BadgePercent },
];

const toOptions = (map) =>
  Object.entries(map).map(([value, { label }]) => ({ value, label }));

const TicketingPage = () => {
  const { user } = useAuth();
  const [tiers, setTiers] = useState(null);
  const [promos, setPromos] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("tiers");
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierModal, setTierModal] = useState({ open: false, editing: null });
  const [promoModal, setPromoModal] = useState({ open: false, editing: null });
  const [deletingTier, setDeletingTier] = useState(null);
  const [deletingPromo, setDeletingPromo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const canDelete = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role);

  useEffect(() => {
    Promise.all([
      ticketService.listTiers(),
      ticketService.listPromos(),
      eventService.list(),
    ])
      .then(([tierResult, promoResult, eventResult]) => {
        setTiers(tierResult.tiers);
        setPromos(promoResult.promos);
        setEvents(eventResult.events);
      })
      .catch((err) => setError(err.message));
  }, []);

  const eventId = eventFilter === "all" ? null : Number(eventFilter);
  const selectedEvent = events.find((event) => event.id === eventId) || null;

  const scopedTiers = useMemo(
    () =>
      (tiers || []).filter(
        (tier) => eventId === null || tier.eventId === eventId,
      ),
    [tiers, eventId],
  );

  const scopedPromos = useMemo(
    () =>
      (promos || []).filter(
        (promo) =>
          eventId === null ||
          promo.eventId === null ||
          promo.eventId === eventId,
      ),
    [promos, eventId],
  );

  const visibleTiers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return scopedTiers.filter((tier) => {
      const matchesSearch =
        !term ||
        [tier.name, tier.eventTitle].some((value) =>
          value.toLowerCase().includes(term),
        );
      return (
        matchesSearch &&
        (statusFilter === "all" || tier.status === statusFilter)
      );
    });
  }, [scopedTiers, search, statusFilter]);

  const visiblePromos = useMemo(() => {
    const term = search.trim().toLowerCase();
    return scopedPromos.filter((promo) => {
      const matchesSearch = !term || promo.code.toLowerCase().includes(term);
      return (
        matchesSearch &&
        (statusFilter === "all" || promoState(promo) === statusFilter)
      );
    });
  }, [scopedPromos, search, statusFilter]);

  const switchTab = (key) => {
    setTab(key);
    setStatusFilter("all");
    setSearch("");
  };

  const clearFilters = () => {
    setSearch("");
    setEventFilter("all");
    setStatusFilter("all");
  };

  const toggleTier = async (tier, checked) => {
    setBusyId(tier.id);
    try {
      const updated = await ticketService.setTierStatus(
        tier.id,
        checked ? "ACTIVE" : "PAUSED",
      );
      setTiers((list) =>
        list.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(`${tier.name} is ${checked ? "on sale" : "paused"}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const togglePromo = async (promo, checked) => {
    setBusyId(promo.id);
    try {
      const updated = await ticketService.setPromoEnabled(promo.id, checked);
      setPromos((list) =>
        list.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(`${promo.code} ${checked ? "enabled" : "disabled"}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleTierSaved = (saved, mode) => {
    if (mode === "create") {
      setTiers((list) => [saved, ...list]);
      toast.success("Tier created. It stays paused until you switch it on.");
    } else {
      setTiers((list) =>
        list.map((item) => (item.id === saved.id ? saved : item)),
      );
      toast.success("Tier updated");
    }
  };

  const handlePromoSaved = (saved, mode) => {
    if (mode === "create") {
      setPromos((list) => [saved, ...list]);
      toast.success(`${saved.code} created`);
    } else {
      setPromos((list) =>
        list.map((item) => (item.id === saved.id ? saved : item)),
      );
      toast.success("Promo code updated");
    }
  };

  const confirmDeleteTier = async () => {
    setBusy(true);
    try {
      await ticketService.removeTier(deletingTier.id);
      setTiers((list) => list.filter((item) => item.id !== deletingTier.id));
      toast.success(`${deletingTier.name} deleted`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      setDeletingTier(null);
    }
  };

  const confirmDeletePromo = async () => {
    setBusy(true);
    try {
      await ticketService.removePromo(deletingPromo.id);
      setPromos((list) => list.filter((item) => item.id !== deletingPromo.id));
      toast.success(`${deletingPromo.code} deleted`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      setDeletingPromo(null);
    }
  };

  const openTierModal = (editing = null) =>
    setTierModal({ open: true, editing });
  const openPromoModal = (editing = null) =>
    setPromoModal({ open: true, editing });

  const closeTierModal = useCallback(
    () => setTierModal((current) => ({ ...current, open: false })),
    [],
  );
  const closePromoModal = useCallback(
    () => setPromoModal((current) => ({ ...current, open: false })),
    [],
  );
  const closeDeleteTier = useCallback(() => setDeletingTier(null), []);
  const closeDeletePromo = useCallback(() => setDeletingPromo(null), []);

  const statusOptions =
    tab === "tiers" ? toOptions(TIER_STATUS) : toOptions(PROMO_STATE);
  const filtersActive =
    search || eventFilter !== "all" || statusFilter !== "all";

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Ticketing & Tiers"
        description="Set the price levels of every event, control what is on sale and manage discount codes."
        actions={
          tab === "tiers" ? (
            <Button onClick={() => openTierModal()}>
              <Plus className="size-4" />
              Create tier
            </Button>
          ) : (
            <Button onClick={() => openPromoModal()}>
              <Plus className="size-4" />
              Create promo code
            </Button>
          )
        }
      />

      {error && (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
          {error}
        </p>
      )}

      {!error && !tiers && (
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

      {tiers && promos && (
        <>
          <TicketingStats tiers={scopedTiers} promos={scopedPromos} />

          {selectedEvent && (
            <SeatReleaseCard
              event={selectedEvent}
              tiers={scopedTiers}
              canEdit
              onAddTier={() => openTierModal()}
            />
          )}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex h-12 shrink-0 rounded-xl border border-line bg-card p-1">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchTab(key)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition ${
                    tab === key
                      ? "bg-elevated text-primary shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs">
                    {key === "tiers" ? scopedTiers.length : scopedPromos.length}
                  </span>
                </button>
              ))}
            </div>

            <label className="relative block flex-1">
              <span className="sr-only">Search</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(change) => setSearch(change.target.value)}
                placeholder={
                  tab === "tiers"
                    ? "Search by tier or event"
                    : "Search by promo code"
                }
                className="h-12 w-full rounded-xl border border-line bg-card pl-11 pr-4 text-sm outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </label>

            <div className="grid grid-cols-2 gap-3 lg:w-[28rem]">
              <SelectField
                aria-label="Filter by event"
                value={eventFilter}
                onChange={(change) => setEventFilter(change.target.value)}
                options={[
                  { value: "all", label: "All events" },
                  ...events.map((event) => ({
                    value: String(event.id),
                    label: event.title,
                  })),
                ]}
              />
              <SelectField
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(change) => setStatusFilter(change.target.value)}
                options={[
                  { value: "all", label: "All statuses" },
                  ...statusOptions,
                ]}
              />
            </div>
          </div>

          {tab === "tiers" &&
            (visibleTiers.length === 0 ? (
              <EmptyState
                icon={Ticket}
                title={filtersActive ? "No tiers match" : "No ticket tiers yet"}
                text={
                  filtersActive
                    ? "Try a different search or clear the filters."
                    : "Create the first tier to start releasing seats for sale."
                }
                action={
                  filtersActive ? (
                    <Button variant="ghost" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : (
                    <Button onClick={() => openTierModal()}>Create tier</Button>
                  )
                }
              />
            ) : (
              <TierTable
                tiers={visibleTiers}
                canDelete={canDelete}
                busyId={busyId}
                onToggle={toggleTier}
                onEdit={openTierModal}
                onDelete={setDeletingTier}
              />
            ))}

          {tab === "promos" &&
            (visiblePromos.length === 0 ? (
              <EmptyState
                icon={BadgePercent}
                title={
                  filtersActive ? "No promo codes match" : "No promo codes yet"
                }
                text={
                  filtersActive
                    ? "Try a different search or clear the filters."
                    : "Create a code like LOOPVIP20 to offer a discount."
                }
                action={
                  filtersActive ? (
                    <Button variant="ghost" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : (
                    <Button onClick={() => openPromoModal()}>
                      Create promo code
                    </Button>
                  )
                }
              />
            ) : (
              <PromoTable
                promos={visiblePromos}
                events={events}
                canDelete={canDelete}
                busyId={busyId}
                onToggle={togglePromo}
                onEdit={openPromoModal}
                onDelete={setDeletingPromo}
              />
            ))}
        </>
      )}

      <TierFormModal
        open={tierModal.open}
        onClose={closeTierModal}
        editing={tierModal.editing}
        defaultEventId={eventId ? String(eventId) : ""}
        events={events}
        tiers={tiers || []}
        onSaved={handleTierSaved}
      />

      <PromoFormModal
        open={promoModal.open}
        onClose={closePromoModal}
        editing={promoModal.editing}
        defaultEventId={eventId ? String(eventId) : "all"}
        events={events}
        tiers={tiers || []}
        promos={promos || []}
        onSaved={handlePromoSaved}
      />

      <ConfirmDialog
        open={Boolean(deletingTier)}
        onClose={closeDeleteTier}
        title="Delete this tier?"
        message={
          deletingTier
            ? `${deletingTier.name} of ${deletingTier.eventTitle} will be removed and its seats go back to the unreleased pool.`
            : ""
        }
        confirmLabel="Delete tier"
        loading={busy}
        onConfirm={confirmDeleteTier}
      />

      <ConfirmDialog
        open={Boolean(deletingPromo)}
        onClose={closeDeletePromo}
        title="Delete this promo code?"
        message={
          deletingPromo
            ? `${deletingPromo.code} will stop working immediately.`
            : ""
        }
        confirmLabel="Delete code"
        loading={busy}
        onConfirm={confirmDeletePromo}
      />
    </div>
  );
};

export default TicketingPage;
