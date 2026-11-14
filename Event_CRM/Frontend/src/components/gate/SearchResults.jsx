import { SearchX } from "lucide-react";
import { TICKET_STATUS } from "../../constants/gate";
import { getInitials } from "../../utils/initials";
import { maskPhone } from "./gateHelpers";

const SearchResults = ({ results, selectedId, onSelect }) => {
  if (!results.length) {
    return (
      <p className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-line px-4 py-8 text-sm text-muted">
        <SearchX className="size-4" />
        No ticket matches this search for the selected event.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">
        {results.length} ticket{results.length === 1 ? "" : "s"} found. Pick the
        guest.
      </p>
      {results.map((ticket) => (
        <button
          key={ticket.id}
          type="button"
          onClick={() => onSelect(ticket)}
          className={`flex w-full items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-left transition hover:border-primary ${
            selectedId === ticket.id ? "border-primary" : "border-line"
          }`}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/12 text-sm font-bold text-primary">
            {getInitials(ticket.holderName)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {ticket.holderName}
            </span>
            <span className="block truncate text-xs text-muted">
              {ticket.code} · {ticket.tierName} · {maskPhone(ticket.phone)}
            </span>
          </span>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${TICKET_STATUS[ticket.status].tone}`}
          >
            {TICKET_STATUS[ticket.status].label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default SearchResults;
