import { CalendarRange, IndianRupee, Ticket, Users } from "lucide-react";
import SpotlightCard from "../common/SpotlightCard";
import { formatCurrency, formatNumber } from "../../utils/format";

const EventStats = ({ events }) => {
  const stats = [
    {
      label: "Total events",
      value: events.length,
      note: "In your pipeline",
      icon: CalendarRange,
    },
    {
      label: "Tickets live",
      value: events.filter((event) => event.status === "TICKETS_LIVE").length,
      note: "Open for booking now",
      icon: Ticket,
    },
    {
      label: "Total capacity",
      value: formatNumber(
        events.reduce((sum, event) => sum + event.capacity, 0),
      ),
      note: "Seats across all events",
      icon: Users,
    },
    {
      label: "Projected revenue",
      value: formatCurrency(
        events.reduce((sum, event) => sum + event.projectedRevenue, 0),
      ),
      note: "What these events should earn",
      icon: IndianRupee,
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

export default EventStats;
