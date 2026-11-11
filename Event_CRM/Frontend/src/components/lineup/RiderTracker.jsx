import { Phone, ShieldCheck } from "lucide-react";
import { LINEUP_STATUS, ROLE_STYLE } from "../../constants/lineup";
import { capacityTone } from "../../utils/format";
import { clock, eventWindow, spanOf } from "../../utils/lineupRules";
import { readiness } from "./lineupHelpers";

const headings = [
  "Artist",
  "Manager contact",
  "Green room",
  "Dietary",
  "Sound rig",
  "Security",
  "Rider readiness",
];

const Note = ({ text }) =>
  text ? (
    <p className="line-clamp-2 max-w-48 text-xs">{text}</p>
  ) : (
    <p className="text-xs text-muted">Not added</p>
  );

const RiderTracker = ({ event, slots, selectedId, onOpen }) => {
  const { gates } = eventWindow(event);

  const rows = [...slots].sort((a, b) => {
    const aCancelled = a.status === "CANCELLED";
    const bCancelled = b.status === "CANCELLED";
    if (aCancelled !== bCancelled) return aCancelled ? 1 : -1;
    return spanOf(a, gates).start - spanOf(b, gates).start;
  });

  return (
    <div className="overflow-x-auto rounded-3xl border border-line bg-card">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs text-muted">
            {headings.map((heading) => (
              <th key={heading} className="px-5 py-4 font-semibold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((slot) => {
            const rider = readiness(slot);
            const cancelled = slot.status === "CANCELLED";
            const span = spanOf(slot, gates);

            return (
              <tr
                key={slot.id}
                tabIndex={0}
                onClick={() => onOpen(slot.id)}
                onKeyDown={(key) => {
                  if (key.key === "Enter") onOpen(slot.id);
                }}
                className={`cursor-pointer border-b border-line transition last:border-0 hover:bg-elevated ${
                  selectedId === slot.id ? "bg-elevated" : ""
                } ${cancelled ? "opacity-50" : ""}`}
              >
                <td className="px-5 py-4">
                  <p className="font-semibold">{slot.artistName}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ROLE_STYLE[slot.role].badge}`}
                    >
                      {slot.role}
                    </span>
                    {slot.status !== "CONFIRMED" && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${LINEUP_STATUS[slot.status].tone}`}
                      >
                        {LINEUP_STATUS[slot.status].label}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    {slot.stage} · {clock(span.start)}
                  </p>
                </td>
                <td className="px-5 py-4">
                  {slot.managerName ? (
                    <>
                      <p className="font-medium">{slot.managerName}</p>
                      {slot.managerPhone && (
                        <a
                          href={`tel:${slot.managerPhone}`}
                          onClick={(click) => click.stopPropagation()}
                          className="mt-1 flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                          <Phone className="size-3.5" />
                          {slot.managerPhone}
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-muted">Not added</p>
                  )}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  {slot.greenRoom ? (
                    <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
                      Room {slot.greenRoom}
                    </span>
                  ) : slot.role === "Guest appearance" ? (
                    <span className="text-xs text-muted">Not needed</span>
                  ) : (
                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-500">
                      Not assigned
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <Note text={slot.dietaryNotes} />
                </td>
                <td className="px-5 py-4">
                  <Note text={slot.soundRigNotes} />
                </td>
                <td className="px-5 py-4">
                  <Note text={slot.securityNotes} />
                  {slot.escortRequired && (
                    <span className="mt-1.5 flex w-fit items-center gap-1 rounded-full bg-primary/12 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      <ShieldCheck className="size-3" />
                      Escort needed
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-line">
                    <div
                      className={`h-full rounded-full ${rider.percent === 100 ? "bg-emerald-500" : capacityTone(0)}`}
                      style={{ width: `${rider.percent}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    {rider.ready} of {rider.total} ready
                  </p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RiderTracker;
