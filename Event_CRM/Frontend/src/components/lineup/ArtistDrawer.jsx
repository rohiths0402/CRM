import {
  CalendarClock,
  ClipboardList,
  DoorOpen,
  Mail,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  UtensilsCrossed,
  Volume2,
} from "lucide-react";
import Button from "../common/Button";
import Drawer from "../common/Drawer";
import {
  LINEUP_STATUS,
  RIDER_CATEGORIES,
  RIDER_STATUS,
  ROLE_STYLE,
} from "../../constants/lineup";
import { formatCurrency, formatPercent } from "../../utils/format";
import {
  clock,
  duration,
  eventWindow,
  spanOf,
  toMinutes,
} from "../../utils/lineupRules";
import { readiness } from "./lineupHelpers";

const statusOptions = Object.entries(RIDER_STATUS);

const Tile = ({ label, value, tone = "" }) => (
  <div className="rounded-xl border border-line bg-elevated px-3 py-2.5 text-center">
    <p className={`text-lg font-semibold ${tone}`}>{value}</p>
    <p className="text-[11px] text-muted">{label}</p>
  </div>
);

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs text-muted">{label}</p>
    <p className="mt-0.5 text-sm font-semibold">{value}</p>
  </div>
);

const NoteRow = ({ icon: Icon, label, text }) => (
  <div className="flex items-start gap-3">
    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
      <Icon className="size-4" />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-sm">{text || "Not added"}</p>
    </div>
  </div>
);

const ArtistDrawer = ({
  slot,
  event,
  issues,
  canDelete,
  locked,
  busyId,
  onClose,
  onEditSlot,
  onDelete,
  onEditRider,
  onAddItem,
  onDeleteItem,
  onChangeItemStatus,
}) => {
  const open = Boolean(slot && event);
  const rider = slot ? readiness(slot) : null;
  const balance = slot ? Math.max(slot.fee - slot.advancePaid, 0) : 0;
  const gates = event ? eventWindow(event).gates : 0;
  const span = slot ? spanOf(slot, gates) : null;

  return (
    <Drawer open={open} onClose={onClose} title="Artist details">
      {open && (
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${ROLE_STYLE[slot.role].badge}`}
              >
                {slot.role}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${LINEUP_STATUS[slot.status].tone}`}
              >
                {LINEUP_STATUS[slot.status].label}
              </span>
            </div>
            <h3 className="mt-3 font-display text-3xl font-semibold leading-tight">
              {slot.artistName}
            </h3>
            <p className="mt-1 text-sm text-muted">{event.title}</p>
          </div>

          {issues.length > 0 && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-rose-500">
                <TriangleAlert className="size-4" />
                Schedule conflict
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-muted">
                {issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-card p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <CalendarClock className="size-4 text-primary" />
              Schedule
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Detail
                label="Performance"
                value={`${clock(span.start)} to ${clock(span.end)}`}
              />
              <Detail
                label="Set length"
                value={duration(span.end - span.start)}
              />
              <Detail label="Stage" value={slot.stage} />
              <Detail
                label="Soundcheck"
                value={
                  slot.soundcheck
                    ? clock(toMinutes(slot.soundcheck))
                    : "Not scheduled"
                }
              />
              <Detail
                label="Green room"
                value={
                  slot.greenRoom ? `Room ${slot.greenRoom}` : "Not assigned"
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-end justify-between">
              <p className="text-sm font-semibold">Fee and advance</p>
              <p className="text-sm text-muted">
                {formatPercent(slot.advancePaid, slot.fee)}% paid
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
                style={{
                  width: `${Math.min(formatPercent(slot.advancePaid, slot.fee), 100)}%`,
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Detail label="Fee" value={formatCurrency(slot.fee)} />
              <Detail
                label="Advance paid"
                value={formatCurrency(slot.advancePaid)}
              />
              <Detail label="Balance" value={formatCurrency(balance)} />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted">Manager</p>
                <p className="mt-0.5 text-sm font-semibold">
                  {slot.managerName || "Not added"}
                </p>
              </div>
              {!locked && (
                <Button
                  variant="ghost"
                  className="h-9 px-4"
                  onClick={onEditRider}
                >
                  <Pencil className="size-3.5" />
                  Edit rider
                </Button>
              )}
            </div>
            {(slot.managerPhone || slot.managerEmail) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {slot.managerPhone && (
                  <a
                    href={`tel:${slot.managerPhone}`}
                    className="flex items-center gap-2 rounded-full border border-line bg-elevated px-4 py-2 text-sm transition hover:border-primary"
                  >
                    <Phone className="size-4 text-primary" />
                    {slot.managerPhone}
                  </a>
                )}
                {slot.managerEmail && (
                  <a
                    href={`mailto:${slot.managerEmail}`}
                    className="flex items-center gap-2 rounded-full border border-line bg-elevated px-4 py-2 text-sm transition hover:border-primary"
                  >
                    <Mail className="size-4 text-primary" />
                    {slot.managerEmail}
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-2xl border border-line bg-card p-4">
            <p className="text-sm font-semibold">Rider notes</p>
            <NoteRow
              icon={UtensilsCrossed}
              label="Dietary"
              text={slot.dietaryNotes}
            />
            <NoteRow
              icon={Volume2}
              label="Sound rig"
              text={slot.soundRigNotes}
            />
            <NoteRow
              icon={ShieldCheck}
              label="Security"
              text={slot.securityNotes}
            />
            {slot.escortRequired && (
              <p className="w-fit rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
                Security escort needed
              </p>
            )}
          </div>

          <section>
            <div className="flex items-center justify-between gap-3">
              <h4 className="flex items-center gap-2 text-lg font-semibold">
                <ClipboardList className="size-5 text-primary" />
                Rider checklist
              </h4>
              {!locked && (
                <Button
                  variant="ghost"
                  className="h-9 px-4"
                  onClick={onAddItem}
                >
                  <Plus className="size-4" />
                  Add
                </Button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Tile label="Ready" value={rider.ready} tone="text-emerald-500" />
              <Tile
                label="Confirmed"
                value={rider.confirmed}
                tone="text-sky-500"
              />
              <Tile
                label="Pending"
                value={rider.pending}
                tone="text-amber-500"
              />
            </div>

            <div className="mt-4 space-y-3">
              {slot.riderItems.map((item) => {
                const Icon = RIDER_CATEGORIES[item.category].icon;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-line bg-card p-4"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.status === "READY"}
                        disabled={locked || busyId === item.id}
                        onChange={(change) =>
                          onChangeItemStatus(
                            item,
                            change.target.checked ? "READY" : "PENDING",
                          )
                        }
                        aria-label={`Mark ${item.label} as ready`}
                        className="mt-1 size-4 shrink-0 accent-[var(--primary)]"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${item.status === "READY" ? "text-muted line-through" : ""}`}
                        >
                          {item.label}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                          <Icon className="size-3.5" />
                          {RIDER_CATEGORIES[item.category].label}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 pl-7">
                      <select
                        value={item.status}
                        disabled={locked || busyId === item.id}
                        onChange={(change) =>
                          onChangeItemStatus(item, change.target.value)
                        }
                        aria-label={`Status of ${item.label}`}
                        className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${RIDER_STATUS[item.status].tone}`}
                      >
                        {statusOptions.map(([value, { label }]) => (
                          <option
                            key={value}
                            value={value}
                            className="bg-elevated text-foreground"
                          >
                            {label}
                          </option>
                        ))}
                      </select>
                      {!locked && (
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item)}
                          aria-label={`Remove ${item.label}`}
                          className="grid size-8 place-items-center rounded-full border border-line bg-elevated text-muted transition hover:text-rose-500"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {!slot.riderItems.length && (
                <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
                  No rider items yet. Add dietary, sound rig, security or travel
                  items to track.
                </p>
              )}
            </div>
          </section>

          {!locked && (
            <div className="border-t border-line pt-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1" onClick={() => onEditSlot(slot)}>
                  <Pencil className="size-4" />
                  Edit slot
                </Button>
                {canDelete && (
                  <Button
                    variant="ghost"
                    className="flex-1 text-rose-500"
                    disabled={slot.advancePaid > 0}
                    onClick={() => onDelete(slot)}
                  >
                    <Trash2 className="size-4" />
                    Delete slot
                  </Button>
                )}
              </div>
              {canDelete && slot.advancePaid > 0 && (
                <p className="mt-3 text-xs text-muted">
                  An advance is already paid. Edit the slot and mark it as
                  Cancelled instead of deleting it.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
};

export default ArtistDrawer;
