import {
  CalendarDays,
  Clock,
  FileText,
  MapPin,
  Mic2,
  Pencil,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import Button from "../common/Button";
import Drawer from "../common/Drawer";
import StatusBadge from "../common/StatusBadge";
import { SelectField } from "../common/FormControls";
import { EVENT_STATUS } from "../../constants/eventStatus";
import { PIPELINE } from "../../constants/eventOptions";
import {
  capacityTone,
  daysUntil,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
} from "../../utils/format";

const countdown = (isoDate) => {
  const days = daysUntil(isoDate);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${Math.abs(days)} days ago`;
  return `In ${days} days`;
};

const InfoRow = ({ icon: Icon, children }) => (
  <div className="flex items-start gap-3 text-sm">
    <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
    <span>{children}</span>
  </div>
);

const Money = ({ label, value, tone = "" }) => (
  <div className="rounded-2xl border border-line bg-card p-4">
    <p className="text-xs text-muted">{label}</p>
    <p className={`mt-1 text-lg font-semibold ${tone}`}>{value}</p>
  </div>
);

const EventDrawer = ({
  event,
  canDelete,
  onClose,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const percent = event ? formatPercent(event.ticketsSold, event.capacity) : 0;
  const profit = event ? event.projectedRevenue - event.budget : 0;

  return (
    <Drawer open={Boolean(event)} onClose={onClose} title="Event details">
      {event && (
        <div className="space-y-6">
          {event.bannerUrl ? (
            <img
              src={event.bannerUrl}
              alt={`${event.title} poster`}
              className="h-48 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="grid h-32 place-items-center rounded-2xl bg-gradient-to-br from-accent/30 to-primary/30 font-display text-2xl text-primary">
              {event.category}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={event.status} />
              <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted">
                {event.category}
              </span>
              <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted">
                {event.ageRating}
              </span>
            </div>
            <h3 className="mt-3 font-display text-3xl font-semibold leading-tight">
              {event.title}
            </h3>
          </div>

          <SelectField
            label="Pipeline stage"
            hint="Moving to Sold out needs every seat to be booked"
            value={event.status}
            onChange={(change) => onStatusChange(event, change.target.value)}
            options={PIPELINE.map((status) => ({
              value: status,
              label: EVENT_STATUS[status].label,
            }))}
          />

          <div className="space-y-3">
            <InfoRow icon={MapPin}>
              {event.venue}, {event.city}
            </InfoRow>
            <InfoRow icon={CalendarDays}>
              {formatDate(event.date)} · {countdown(event.date)}
            </InfoRow>
            <InfoRow icon={Clock}>
              Gates {event.gatesOpen} · Show {event.showStart} · Curfew{" "}
              {event.curfew}
            </InfoRow>
            {event.headliner && (
              <InfoRow icon={Mic2}>{event.headliner}</InfoRow>
            )}
            <InfoRow icon={Users}>
              {event.sponsors} sponsor{event.sponsors === 1 ? "" : "s"}
            </InfoRow>
            {event.description && (
              <InfoRow icon={FileText}>{event.description}</InfoRow>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-end justify-between">
              <p className="text-sm font-semibold">Tickets sold</p>
              <p className="text-sm text-muted">{percent}%</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
              <div
                className={`h-full rounded-full ${capacityTone(percent)}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              {formatNumber(event.ticketsSold)} of{" "}
              {formatNumber(event.capacity)} seats
            </p>
          </div>

          <div>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-primary" />
              Money
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Money
                label="Production budget"
                value={formatCurrency(event.budget)}
              />
              <Money
                label="Projected revenue"
                value={formatCurrency(event.projectedRevenue)}
              />
              <Money
                label="Earned from tickets so far"
                value={formatCurrency(event.grossRevenue)}
              />
              <Money
                label="Projected profit"
                value={`${formatCurrency(Math.abs(profit))}${profit < 0 ? " loss" : ""}`}
                tone={profit < 0 ? "text-rose-500" : "text-emerald-500"}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
            <Button className="flex-1" onClick={() => onEdit(event)}>
              <Pencil className="size-4" />
              Edit event
            </Button>
            {canDelete && (
              <Button
                variant="ghost"
                className="flex-1 text-rose-500"
                onClick={() => onDelete(event)}
              >
                <Trash2 className="size-4" />
                Delete event
              </Button>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default EventDrawer;
