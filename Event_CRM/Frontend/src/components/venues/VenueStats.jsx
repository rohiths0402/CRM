import { Building2, CalendarCheck, ShieldAlert, Users } from "lucide-react";
import SpotlightCard from "../common/SpotlightCard";
import { formatNumber } from "../../utils/format";
import { needsAttention } from "./venueHelpers";

const VenueStats = ({ venues }) => {
  const attention = venues.filter(needsAttention).length;

  const stats = [
    {
      label: "Total venues",
      value: venues.length,
      note: "In Venue Master",
      icon: Building2,
    },
    {
      label: "Licensed capacity",
      value: formatNumber(
        venues.reduce((sum, venue) => sum + venue.capacity, 0),
      ),
      note: "People across all venues",
      icon: Users,
    },
    {
      label: "Events booked",
      value: venues.reduce((sum, venue) => sum + venue.eventsCount, 0),
      note: "Across all venues",
      icon: CalendarCheck,
    },
    {
      label: "Need attention",
      value: attention,
      note: attention
        ? "Fire NOC or zone safety check pending"
        : "Everything is cleared",
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, note, icon: Icon }) => (
        <SpotlightCard key={label} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold">{label}</p>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
              <Icon className="size-[18px]" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
          <p className="mt-1 text-xs text-muted">{note}</p>
        </SpotlightCard>
      ))}
    </div>
  );
};

export default VenueStats;
