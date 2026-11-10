import { CalendarDays, MapPin, Sparkles, Ticket } from "lucide-react";
import { EVENT_STATUS } from "../../constants/eventStatus";
import {
  capacityTone,
  formatDate,
  formatNumber,
  formatPercent,
} from "../../utils/format";

const EventKanban = ({ events, onOpen }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {events.map((event) => {
        const percent = formatPercent(event.ticketsSold, event.capacity);
        const statusConfig = EVENT_STATUS[event.status] || {
          label: event.status,
          color: "#94a3b8",
        };

        return (
          <div
            key={event.id}
            onClick={() => onOpen(event.id)}
            className="group flex flex-col justify-between rounded-2xl border border-line bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {event.category}
                </span>

                <div className="flex items-center gap-1.5 rounded-full border border-line bg-elevated px-2.5 py-1 text-xs font-medium">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: statusConfig.color }}
                  />
                  <span>{statusConfig.label}</span>
                </div>
              </div>

              <h3 className="mt-4 text-base font-semibold text-foreground line-clamp-2 transition-colors group-hover:text-primary">
                {event.title}
              </h3>

              {event.headliner && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                  <Sparkles className="size-3.5 shrink-0 text-amber-500" />
                  <span className="truncate">{event.headliner}</span>
                </div>
              )}

              <div className="mt-4 space-y-2 border-t border-line/60 pt-4 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 shrink-0 text-muted/70" />
                  <span>{formatDate(event.date)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-muted/70" />
                  <span className="truncate">
                    {event.venue ? `${event.venue}, ` : ""}
                    {event.city}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-line/60 pt-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted">
                  <Ticket className="size-3.5" />
                  {formatNumber(event.ticketsSold)} /{" "}
                  {formatNumber(event.capacity)}
                </span>
                <span className="font-semibold text-foreground">
                  {Math.round(percent)}%
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${capacityTone(
                    percent,
                  )}`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventKanban;
