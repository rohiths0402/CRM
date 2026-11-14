import { History } from "lucide-react";
import { getInitials } from "../../utils/initials";
import { ago } from "./gateHelpers";

const RecentCheckIns = ({ entries, onSelect }) => (
  <div className="rounded-3xl border border-line bg-card p-6">
    <h3 className="flex items-center gap-2 text-lg font-semibold">
      <History className="size-5 text-primary" />
      Recent check-ins
    </h3>
    <p className="mt-1 text-sm text-muted">
      The last guests who went inside. Click one to see the ticket.
    </p>

    <div className="mt-4 space-y-2">
      {entries.map((ticket) => (
        <button
          key={ticket.id}
          type="button"
          onClick={() => onSelect(ticket)}
          className="flex w-full items-center gap-3 rounded-2xl border border-line bg-elevated px-3.5 py-3 text-left transition hover:border-primary"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/12 text-xs font-bold text-primary">
            {getInitials(ticket.holderName)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {ticket.holderName}
            </span>
            <span className="block truncate text-xs text-muted">
              {ticket.tierName} · {ticket.checkedInGate}
            </span>
          </span>
          <span className="shrink-0 text-xs text-muted">
            {ago(ticket.checkedInAt)}
          </span>
        </button>
      ))}
      {!entries.length && (
        <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
          Nobody has checked in yet.
        </p>
      )}
    </div>
  </div>
);

export default RecentCheckIns;
