import { ChevronDown } from "lucide-react";

const EventScopeSelect = ({ events, value, onChange }) => (
  <label className="flex min-w-0 flex-col gap-1.5 sm:w-80">
    <span className="text-sm font-medium text-muted">Show numbers for</span>
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full cursor-pointer appearance-none rounded-full border border-line bg-elevated pl-5 pr-11 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
      >
        <option value="all" className="bg-elevated text-foreground">
          All events ({events.length})
        </option>
        {events.map((event) => (
          <option
            key={event.id}
            value={event.id}
            className="bg-elevated text-foreground"
          >
            {event.title} · {event.city}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
    </div>
  </label>
);

export default EventScopeSelect;
