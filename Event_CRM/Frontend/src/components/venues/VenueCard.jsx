import {
  CalendarCheck,
  Car,
  DoorOpen,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import SpotlightCard from "../common/SpotlightCard";
import VenueFact from "./VenueFact";
import { STATE_NAMES } from "../../constants/indiaStates";
import {
  capacityTone,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "../../utils/format";
import { nocState, zoneSummary } from "./venueHelpers";

const VenueCard = ({ venue, onOpen }) => {
  const summary = zoneSummary(venue);
  const noc = nocState(venue.fireNocValidTill);
  const allocatedPercent = formatPercent(summary.allocated, venue.capacity);
  const allVerified = summary.total > 0 && summary.verified === summary.total;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(venue.id)}
      onKeyDown={(key) => {
        if (key.key === "Enter") onOpen(venue.id);
      }}
      className="cursor-pointer"
    >
      <SpotlightCard className="h-full p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted">
            {venue.type}
          </span>
          {noc.key !== "valid" && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${noc.tone}`}
            >
              {noc.label}
            </span>
          )}
        </div>

        <h3 className="mt-4 font-display text-2xl font-semibold leading-tight">
          {venue.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-primary">
          {venue.city}, {STATE_NAMES[venue.stateSlug]}
        </p>
        <p className="mt-2 flex items-start gap-2 text-sm text-muted">
          <MapPin className="mt-0.5 size-4 shrink-0" />
          <span className="line-clamp-2">{venue.address}</span>
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
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

        <div className="mt-6">
          <div className="flex items-end justify-between text-xs">
            <span className="font-semibold">Seats allocated to zones</span>
            <span className="text-muted">{allocatedPercent}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
            <div
              className={`h-full rounded-full ${summary.total ? capacityTone(allocatedPercent === 100 ? 0 : allocatedPercent) : ""}`}
              style={{ width: `${Math.min(allocatedPercent, 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {summary.total
              ? `${formatNumber(summary.allocated)} of ${formatNumber(venue.capacity)} seats in ${summary.total} zones`
              : "No seating zones added yet"}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs">
          <span
            className={`flex items-center gap-1.5 font-medium ${allVerified ? "text-emerald-500" : "text-amber-500"}`}
          >
            <ShieldCheck className="size-4" />
            {summary.total
              ? `${summary.verified} of ${summary.total} zones verified`
              : "Safety not set up"}
          </span>
          <span className="flex items-center gap-1.5 text-muted">
            <CalendarCheck className="size-4" />
            {venue.eventsCount} event{venue.eventsCount === 1 ? "" : "s"}
          </span>
        </div>
      </SpotlightCard>
    </div>
  );
};

export default VenueCard;
