import { DoorClosed, DoorOpen } from "lucide-react";
import { EVENT_STATUS } from "../../constants/eventStatus";

const GateStatusBanner = ({ open, status }) =>
  open ? (
    <p className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
      <DoorOpen className="size-5 shrink-0 text-emerald-500" />
      <span>
        <span className="font-semibold text-emerald-500">Gates are open.</span>{" "}
        Check-in is live for this event.
      </span>
    </p>
  ) : (
    <p className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
      <DoorClosed className="size-5 shrink-0 text-amber-500" />
      <span>
        <span className="font-semibold text-amber-500">Gates are closed.</span>{" "}
        This event is {EVENT_STATUS[status].label}. Check-in starts when the
        event is moved to Ongoing in Events Master. You can still search
        tickets.
      </span>
    </p>
  );

export default GateStatusBanner;
