import {
  Armchair,
  Ban,
  CheckCircle2,
  DoorOpen,
  MapPin,
  ShieldAlert,
  Tag,
  Ticket,
  TriangleAlert,
  Undo2,
} from "lucide-react";
import Button from "../common/Button";
import { GATE_ERROR, TICKET_STATUS } from "../../constants/gate";
import { getInitials } from "../../utils/initials";
import { maskPhone, timeOf } from "./gateHelpers";

const problemTone = {
  [GATE_ERROR.ALREADY_CHECKED_IN]:
    "border-rose-500/30 bg-rose-500/10 text-rose-500",
  [GATE_ERROR.TICKET_CANCELLED]:
    "border-rose-500/30 bg-rose-500/10 text-rose-500",
  [GATE_ERROR.GATE_CLOSED]:
    "border-amber-500/30 bg-amber-500/10 text-amber-500",
  [GATE_ERROR.WRONG_GATE]: "border-amber-500/30 bg-amber-500/10 text-amber-500",
};

const Field = ({ icon: Icon, label, value, hint }) => (
  <div className="rounded-2xl border border-line bg-elevated p-4">
    <p className="flex items-center gap-2 text-xs text-muted">
      <Icon className="size-3.5 text-primary" />
      {label}
    </p>
    <p className="mt-1.5 text-sm font-semibold">{value}</p>
    <p className="mt-0.5 text-[11px] text-muted">{hint}</p>
  </div>
);

const AttendeeCard = ({
  ticket,
  problem,
  gate,
  gateOpen,
  justCheckedIn,
  canUndo,
  busy,
  onCheckIn,
  onUndo,
  onNext,
}) => {
  const status = TICKET_STATUS[ticket.status];
  const wrongGate =
    ticket.status === "VALID" && gate !== "any" && gate !== ticket.gate;

  return (
    <div className="rounded-3xl border border-line bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-primary text-lg font-bold text-on-primary">
            {getInitials(ticket.holderName)}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-display text-2xl font-semibold leading-tight">
              {ticket.holderName}
            </h3>
            <p className="mt-0.5 text-sm text-muted">
              Mobile {maskPhone(ticket.phone)}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}
        >
          {status.label}
        </span>
      </div>

      {ticket.status === "CHECKED_IN" && justCheckedIn && (
        <p className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
          <span>
            <span className="font-semibold text-emerald-500">Checked in.</span>{" "}
            Entered at {timeOf(ticket.checkedInAt)} through{" "}
            {ticket.checkedInGate}. Let the guest in.
          </span>
        </p>
      )}

      {ticket.status === "CHECKED_IN" && !justCheckedIn && (
        <p className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-rose-500" />
          <span>
            <span className="font-semibold text-rose-500">Already inside.</span>{" "}
            Checked in at {timeOf(ticket.checkedInAt)} through{" "}
            {ticket.checkedInGate}. If a different person is showing this QR
            code, do not allow entry.
          </span>
        </p>
      )}

      {ticket.status === "CANCELLED" && (
        <p className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm">
          <Ban className="mt-0.5 size-5 shrink-0 text-rose-500" />
          <span>
            <span className="font-semibold text-rose-500">
              Cancelled ticket.
            </span>{" "}
            This ticket was refunded. Do not allow entry.
          </span>
        </p>
      )}

      {problem && (
        <p
          role="alert"
          className={`mt-3 flex items-start gap-3 rounded-2xl border p-4 text-sm ${problemTone[problem.code] || "border-rose-500/30 bg-rose-500/10 text-rose-500"}`}
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" />
          {problem.message}
        </p>
      )}

      {wrongGate && (
        <p className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <span>
            <span className="font-semibold text-amber-500">Wrong gate.</span>{" "}
            This ticket is for {ticket.gate}, you are at {gate}. Send the guest
            to {ticket.gate}, or check in anyway if you are sure.
          </span>
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field
          icon={Ticket}
          label="Ticket code"
          value={ticket.code}
          hint="Printed under the QR code"
        />
        <Field
          icon={Tag}
          label="Ticket type"
          value={ticket.tierName}
          hint="The price level the guest bought"
        />
        <Field
          icon={DoorOpen}
          label="Gate"
          value={ticket.gate}
          hint="The entrance this ticket must use"
        />
        <Field
          icon={MapPin}
          label="Zone"
          value={ticket.zone}
          hint="The area inside the venue"
        />
        <div className="sm:col-span-2">
          <Field
            icon={Armchair}
            label="Seat"
            value={ticket.seat}
            hint="Tell the guest where to sit or stand"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {ticket.status === "VALID" && (
          <Button
            className={`h-14 flex-1 text-base ${wrongGate ? "from-amber-400 to-amber-600" : ""}`}
            disabled={!gateOpen}
            loading={busy}
            onClick={() => onCheckIn(wrongGate)}
          >
            {!gateOpen
              ? "Gates are closed"
              : wrongGate
                ? "Check in anyway"
                : "Mark checked in"}
          </Button>
        )}

        {ticket.status !== "VALID" && (
          <Button className="h-14 flex-1 text-base" onClick={onNext}>
            Next guest
          </Button>
        )}

        {ticket.status === "CHECKED_IN" && canUndo && gateOpen && (
          <Button
            variant="ghost"
            className="h-14 flex-1 text-base"
            onClick={onUndo}
          >
            <Undo2 className="size-4" />
            Undo check-in
          </Button>
        )}
      </div>
    </div>
  );
};

export default AttendeeCard;
