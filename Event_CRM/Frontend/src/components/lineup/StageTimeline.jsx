import { TriangleAlert, Volume2 } from "lucide-react";
import { ROLE_STYLE } from "../../constants/lineup";
import { to24Hour } from "../../utils/format";
import {
  SOUNDCHECK_BLOCK,
  clock,
  eventWindow,
  spanOf,
  toMinutes,
} from "../../utils/lineupRules";

const PX_PER_MINUTE = 1.6;
const LABEL_WIDTH = 150;
const LANE_HEIGHT = 76;

const StageTimeline = ({ event, slots, selectedId, conflictIds, onSelect }) => {
  const { gates, curfew } = eventWindow(event);
  const active = slots.filter((slot) => slot.status !== "CANCELLED");

  const checks = active
    .filter((slot) => slot.soundcheck)
    .map((slot) => toMinutes(slot.soundcheck));
  const ends = active.map((slot) => spanOf(slot, gates).end);

  const rangeStart = Math.floor((Math.min(gates, ...checks) - 15) / 60) * 60;
  const rangeEnd = Math.ceil(Math.max(curfew, ...ends) / 60) * 60;
  const width = (rangeEnd - rangeStart) * PX_PER_MINUTE;
  const hours = Array.from(
    { length: (rangeEnd - rangeStart) / 60 + 1 },
    (_, index) => rangeStart + index * 60,
  );

  let show = toMinutes(to24Hour(event.showStart));
  if (show < gates) show += 1440;

  const clockNow = new Date();
  let now = clockNow.getHours() * 60 + clockNow.getMinutes();
  if (now < rangeStart) now += 1440;
  const showNow =
    event.date === clockNow.toLocaleDateString("en-CA") && now <= rangeEnd;

  const stages = [...active]
    .sort((a, b) => spanOf(a, gates).start - spanOf(b, gates).start)
    .map((slot) => slot.stage)
    .filter(
      (stage, index, list) =>
        list.findIndex((item) => item.toLowerCase() === stage.toLowerCase()) ===
        index,
    );

  const left = (minutes) => (minutes - rangeStart) * PX_PER_MINUTE;

  const markers = [
    {
      key: "gates",
      label: `Gates ${clock(gates)}`,
      minutes: gates,
      line: "bg-emerald-500",
      chip: "bg-emerald-500 text-white",
    },
    {
      key: "show",
      label: `Show ${clock(show)}`,
      minutes: show,
      line: "bg-primary",
      chip: "bg-primary text-on-primary",
    },
    {
      key: "curfew",
      label: `Curfew ${clock(curfew)}`,
      minutes: curfew,
      line: "bg-rose-500",
      chip: "bg-rose-500 text-white",
    },
  ];

  return (
    <div>
      <div className="overflow-x-auto rounded-3xl border border-line bg-card">
        <div style={{ width: LABEL_WIDTH + width }}>
          <div className="flex border-b border-line">
            <div
              className="sticky left-0 z-30 shrink-0 border-r border-line bg-card"
              style={{ width: LABEL_WIDTH }}
            />
            <div className="relative h-16" style={{ width }}>
              {hours.map((minutes) => (
                <span
                  key={minutes}
                  className="absolute top-2 whitespace-nowrap pl-1.5 text-xs text-muted"
                  style={{ left: left(minutes) }}
                >
                  {clock(minutes)}
                </span>
              ))}
              {markers.map((marker) => (
                <span
                  key={marker.key}
                  className={`absolute bottom-1.5 z-20 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${marker.chip}`}
                  style={{ left: left(marker.minutes) }}
                >
                  {marker.label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            {stages.map((stage) => {
              const sameStage = (slot) =>
                slot.stage.toLowerCase() === stage.toLowerCase();

              return (
                <div
                  key={stage}
                  className="flex border-b border-line last:border-0"
                  style={{ height: LANE_HEIGHT }}
                >
                  <div
                    className="sticky left-0 z-30 flex shrink-0 items-center border-r border-line bg-card px-4 text-sm font-semibold"
                    style={{ width: LABEL_WIDTH }}
                  >
                    {stage}
                  </div>

                  <div
                    className="relative"
                    style={{
                      width,
                      backgroundImage:
                        "linear-gradient(to right, var(--line) 1px, transparent 1px)",
                      backgroundSize: `${60 * PX_PER_MINUTE}px 100%`,
                    }}
                  >
                    {active
                      .filter((slot) => sameStage(slot) && slot.soundcheck)
                      .map((slot) => (
                        <button
                          key={`check-${slot.id}`}
                          type="button"
                          onClick={() => onSelect(slot.id)}
                          title={`${slot.artistName} soundcheck, ${clock(toMinutes(slot.soundcheck))}`}
                          className="absolute top-3 z-20 grid h-[52px] place-items-center rounded-xl border border-dashed border-primary/60 bg-primary/10 text-primary transition hover:bg-primary/20"
                          style={{
                            left: left(toMinutes(slot.soundcheck)),
                            width: SOUNDCHECK_BLOCK * PX_PER_MINUTE,
                          }}
                        >
                          <Volume2 className="size-4" />
                        </button>
                      ))}

                    {active.filter(sameStage).map((slot) => {
                      const span = spanOf(slot, gates);
                      const tentative = slot.status === "TENTATIVE";
                      const conflict = conflictIds.has(slot.id);

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => onSelect(slot.id)}
                          title={`${slot.artistName}, ${clock(span.start)} to ${clock(span.end)}`}
                          className={`absolute top-3 z-20 flex h-[52px] flex-col justify-center overflow-hidden rounded-xl px-2.5 text-left transition hover:brightness-110 ${ROLE_STYLE[slot.role].block} ${
                            tentative
                              ? "border-2 border-dashed border-white/70 opacity-80"
                              : ""
                          } ${conflict ? "ring-2 ring-rose-500 ring-offset-2 ring-offset-card" : ""} ${
                            selectedId === slot.id
                              ? "ring-2 ring-foreground ring-offset-2 ring-offset-card"
                              : ""
                          }`}
                          style={{
                            left: left(span.start),
                            width: (span.end - span.start) * PX_PER_MINUTE,
                          }}
                        >
                          <span className="flex items-center gap-1 truncate text-xs font-semibold">
                            {conflict && (
                              <TriangleAlert className="size-3 shrink-0" />
                            )}
                            {slot.artistName}
                          </span>
                          <span className="truncate text-[11px] opacity-90">
                            {clock(span.start)} to {clock(span.end)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div
              className="pointer-events-none absolute inset-y-0 z-10"
              style={{ left: LABEL_WIDTH, width }}
            >
              {markers.map((marker) => (
                <span
                  key={marker.key}
                  className={`absolute inset-y-0 w-px ${marker.line}`}
                  style={{ left: left(marker.minutes) }}
                />
              ))}
              {showNow && (
                <span
                  className="absolute inset-y-0 w-0.5 bg-foreground"
                  style={{ left: left(now) }}
                >
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold text-background">
                    Now
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-primary" />
          Confirmed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded border-2 border-dashed border-primary" />
          Tentative
        </span>
        <span className="flex items-center gap-1.5">
          <Volume2 className="size-3.5 text-primary" />
          Soundcheck, 30 minutes
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded ring-2 ring-rose-500" />
          Schedule conflict
        </span>
        <span>Click any block for details</span>
      </p>
    </div>
  );
};

export default StageTimeline;
