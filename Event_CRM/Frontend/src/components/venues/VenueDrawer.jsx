import {
  Accessibility,
  CalendarDays,
  Car,
  Check,
  DoorOpen,
  Flame,
  IndianRupee,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  TriangleAlert,
  Users,
  X,
  Zap,
} from "lucide-react";
import Button from "../common/Button";
import Drawer from "../common/Drawer";
import StatusBadge from "../common/StatusBadge";
import VenueFact from "./VenueFact";
import { STATE_NAMES } from "../../constants/indiaStates";
import { SAFETY_STATUS } from "../../constants/venueOptions";
import {
  capacityTone,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
} from "../../utils/format";
import { nocState, zoneSummary } from "./venueHelpers";

const Facility = ({ icon: Icon, label, active }) => (
  <span
    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
      active
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
        : "border-line text-muted"
    }`}
  >
    <Icon className="size-3.5" />
    {label}
    {active ? <Check className="size-3.5" /> : <X className="size-3.5" />}
  </span>
);

const ZoneCard = ({ zone, onEdit, onDelete }) => {
  const percent = formatPercent(zone.sold, zone.capacity);
  const safety = SAFETY_STATUS[zone.safetyStatus];

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{zone.name}</p>
          <p className="mt-0.5 text-xs text-muted">{zone.kind}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${safety.tone}`}
        >
          {safety.label}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between text-xs">
          <span className="text-muted">
            {formatNumber(zone.sold)} sold of {formatNumber(zone.capacity)}{" "}
            seats
          </span>
          <span className="font-semibold">{percent}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
          <div
            className={`h-full rounded-full ${capacityTone(percent)}`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {zone.fireExits} fire exit{zone.fireExits === 1 ? "" : "s"} ·{" "}
          {zone.lastInspection
            ? `Inspected ${formatDate(zone.lastInspection)}`
            : "Not inspected yet"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(zone)}
            aria-label={`Edit ${zone.name}`}
            className="grid size-8 place-items-center rounded-full border border-line bg-elevated text-muted transition hover:text-foreground"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(zone)}
            aria-label={`Remove ${zone.name}`}
            className="grid size-8 place-items-center rounded-full border border-line bg-elevated text-muted transition hover:text-rose-500"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const VenueDrawer = ({
  venue,
  events,
  canDelete,
  onClose,
  onEditVenue,
  onDeleteVenue,
  onAddZone,
  onEditZone,
  onDeleteZone,
}) => {
  const summary = venue ? zoneSummary(venue) : null;
  const noc = venue ? nocState(venue.fireNocValidTill) : null;
  const allocatedPercent = venue
    ? formatPercent(summary.allocated, venue.capacity)
    : 0;

  return (
    <Drawer open={Boolean(venue)} onClose={onClose} title="Venue details">
      {venue && (
        <div className="space-y-6">
          <div>
            <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted">
              {venue.type}
            </span>
            <h3 className="mt-3 font-display text-3xl font-semibold leading-tight">
              {venue.name}
            </h3>
            <p className="mt-2 flex items-start gap-2 text-sm text-muted">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {venue.address}
            </p>
            <p className="mt-1 text-xs text-muted">
              {venue.city}, {STATE_NAMES[venue.stateSlug]}
            </p>
          </div>

          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 ${
              noc.key === "valid"
                ? "border-emerald-500/30 bg-emerald-500/10"
                : noc.key === "expiring"
                  ? "border-amber-500/30 bg-amber-500/10"
                  : "border-rose-500/30 bg-rose-500/10"
            }`}
          >
            {noc.key === "valid" ? (
              <Flame className="mt-0.5 size-5 shrink-0 text-emerald-500" />
            ) : (
              <TriangleAlert
                className={`mt-0.5 size-5 shrink-0 ${noc.key === "expiring" ? "text-amber-500" : "text-rose-500"}`}
              />
            )}
            <div>
              <p className="text-sm font-semibold">{noc.label}</p>
              <p className="mt-0.5 text-xs text-muted">
                Valid till {formatDate(venue.fireNocValidTill)}
                {noc.key === "expired" &&
                  ". Renew it before any event goes live here."}
                {noc.key === "expiring" && ". Start the renewal soon."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <VenueFact
              icon={Users}
              label="Licensed capacity"
              value={formatNumber(venue.capacity)}
            />
            <VenueFact
              icon={IndianRupee}
              label="Base rent per day"
              value={formatCurrency(venue.baseRent)}
            />
            <VenueFact
              icon={Car}
              label="Parking stalls"
              value={formatNumber(venue.parkingStalls)}
            />
            <VenueFact
              icon={DoorOpen}
              label="Green rooms"
              value={venue.greenRooms}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Facility
              icon={Zap}
              label="Power backup"
              active={venue.powerBackup}
            />
            <Facility
              icon={Accessibility}
              label="Wheelchair access"
              active={venue.wheelchairAccess}
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card p-4">
            <div className="min-w-0">
              <p className="text-xs text-muted">Venue contact</p>
              <p className="mt-0.5 truncate text-sm font-semibold">
                {venue.contactName}
              </p>
            </div>
            <a
              href={`tel:${venue.contactPhone}`}
              className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-elevated px-4 py-2 text-sm font-medium transition hover:border-primary"
            >
              <Phone className="size-4 text-primary" />
              {venue.contactPhone}
            </a>
          </div>

          <section>
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-semibold">Seating zones</h4>
              <Button variant="ghost" className="h-9 px-4" onClick={onAddZone}>
                <Plus className="size-4" />
                Add zone
              </Button>
            </div>

            <div className="mt-4 rounded-2xl border border-line bg-card p-4">
              <div className="flex items-end justify-between text-xs">
                <span className="font-semibold">
                  {formatNumber(summary.allocated)} of{" "}
                  {formatNumber(venue.capacity)} seats allocated
                </span>
                <span className="text-muted">{allocatedPercent}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
                  style={{ width: `${Math.min(allocatedPercent, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted">
                {summary.left > 0
                  ? `${formatNumber(summary.left)} seats are still not given to any zone`
                  : "Every licensed seat is given to a zone"}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {venue.zones.map((zone) => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  onEdit={onEditZone}
                  onDelete={onDeleteZone}
                />
              ))}
              {!venue.zones.length && (
                <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
                  No zones yet. Add VVIP, Platinum, Gold or Silver zones to
                  split the seats.
                </p>
              )}
            </div>

            {venue.zones.length > 0 && (
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-emerald-500" />
                  Under 75%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-amber-500" />
                  75% to 99%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-500" />
                  Full
                </span>
              </p>
            )}
          </section>

          <section>
            <h4 className="text-lg font-semibold">Events booked here</h4>
            <div className="mt-4 space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {event.title}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                      <CalendarDays className="size-3.5" />
                      {formatDate(event.date)}
                    </p>
                  </div>
                  <StatusBadge status={event.status} />
                </div>
              ))}
              {!events.length && (
                <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
                  No events are booked at this venue yet.
                </p>
              )}
            </div>
          </section>

          <div className="border-t border-line pt-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1" onClick={() => onEditVenue(venue)}>
                <Pencil className="size-4" />
                Edit venue
              </Button>
              {canDelete && (
                <Button
                  variant="ghost"
                  className="flex-1 text-rose-500"
                  disabled={venue.eventsCount > 0}
                  onClick={() => onDeleteVenue(venue)}
                >
                  <Trash2 className="size-4" />
                  Delete venue
                </Button>
              )}
            </div>
            {canDelete && venue.eventsCount > 0 && (
              <p className="mt-3 text-xs text-muted">
                A venue with booked events cannot be deleted.
              </p>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default VenueDrawer;
