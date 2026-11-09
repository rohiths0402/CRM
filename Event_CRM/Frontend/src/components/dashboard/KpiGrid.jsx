import { CalendarRange, Handshake, IndianRupee, Ticket } from "lucide-react";
import SpotlightCard from "../common/SpotlightCard";

const icons = {
  events: CalendarRange,
  tickets: Ticket,
  revenue: IndianRupee,
  sponsors: Handshake,
};

const KpiGrid = ({ kpis }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {kpis
      ? kpis.map((kpi) => {
          const Icon = icons[kpi.key];
          return (
            <SpotlightCard key={kpi.key} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold">{kpi.label}</p>
                {Icon && (
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                    <Icon className="size-5" />
                  </span>
                )}
              </div>
              <p className="mt-4 font-display text-4xl font-semibold">
                {kpi.value}
              </p>
              <p className="mt-1 text-sm text-muted">{kpi.note}</p>

              {kpi.progress !== undefined && (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
                      style={{ width: `${kpi.progress}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    {kpi.progress}% of seats sold
                  </p>
                </div>
              )}
            </SpotlightCard>
          );
        })
      : Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-3xl bg-card" />
        ))}
  </div>
);

export default KpiGrid;
