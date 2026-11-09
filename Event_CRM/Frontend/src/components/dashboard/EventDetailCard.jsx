import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock,
  MapPin,
  MapPinned,
  Mic2,
  ScanLine,
  Users,
} from "lucide-react";
import Button from "../common/Button";
import { useAuth } from "../../context/AuthContext";
import { EVENT_STATUS } from "../../constants/eventStatus";
import { ROLE_ACCESS } from "../../constants/roles";
import { formatCurrency, formatDate, formatNumber } from "../../utils/format";

const barTone = (percent) => {
  if (percent >= 100) return "bg-rose-500";
  if (percent >= 75) return "bg-amber-500";
  return "bg-emerald-500";
};

const StatusBadge = ({ status }) => {
  const { label, tone } = EVENT_STATUS[status];
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      {label}
    </span>
  );
};

const InfoRow = ({ icon: Icon, children }) => (
  <div className="flex items-start gap-3 text-sm">
    <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
    <span>{children}</span>
  </div>
);

const EmptyView = ({ summary, onSelectState }) => (
  <div>
    <span className="grid size-12 place-items-center rounded-2xl bg-primary/12 text-primary">
      <MapPinned className="size-6" />
    </span>
    <h3 className="mt-5 font-display text-2xl font-semibold">Pick a state</h3>
    <p className="mt-2 text-sm text-muted">
      Click a state on the map to see where events are happening, then click a
      point for its details.
    </p>

    <p className="mb-3 mt-8 text-sm font-semibold">Events by state</p>
    <div className="space-y-2">
      {summary.map((item) => (
        <button
          key={item.slug}
          type="button"
          onClick={() => onSelectState(item.slug)}
          className="flex w-full items-center justify-between rounded-xl border border-line bg-elevated px-4 py-3 text-left text-sm transition hover:border-primary"
        >
          <span className="font-medium">{item.name}</span>
          <span className="flex items-center gap-2 text-muted">
            {item.count}
            <ChevronRight className="size-4" />
          </span>
        </button>
      ))}
    </div>
  </div>
);

const StateView = ({ stateName, events, onSelectEvent }) => (
  <div>
    <h3 className="font-display text-2xl font-semibold">{stateName}</h3>
    <p className="mt-1 text-sm text-muted">
      {events.length
        ? `${events.length} event${events.length > 1 ? "s" : ""}. Pick one here or click a point on the map.`
        : "No events in this state yet."}
    </p>

    <div className="mt-6 space-y-3">
      {events.map((event) => (
        <button
          key={event.id}
          type="button"
          onClick={() => onSelectEvent(event.id)}
          className="w-full rounded-2xl border border-line bg-elevated p-4 text-left transition hover:border-primary"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold leading-snug">{event.title}</p>
            <StatusBadge status={event.status} />
          </div>
          <p className="mt-2 text-xs text-muted">
            {event.city} · {formatDate(event.date)}
          </p>
        </button>
      ))}
    </div>
  </div>
);

const EventView = ({ event, onBackToList }) => {
  const { user } = useAuth();
  const access = ROLE_ACCESS[user.role];
  const percent = Math.round((event.ticketsSold / event.capacity) * 100);

  return (
    <div>
      <button
        type="button"
        onClick={onBackToList}
        className="mb-5 flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All events in this state
      </button>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={event.status} />
        <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted">
          {event.category}
        </span>
      </div>

      <h3 className="mt-4 font-display text-3xl font-semibold leading-tight">
        {event.title}
      </h3>

      <div className="mt-5 space-y-3">
        <InfoRow icon={MapPin}>
          {event.venue}, {event.city}
        </InfoRow>
        <InfoRow icon={CalendarDays}>{formatDate(event.date)}</InfoRow>
        <InfoRow icon={Clock}>
          Gates {event.gatesOpen} · Show {event.showStart}
        </InfoRow>
        <InfoRow icon={Mic2}>{event.headliner}</InfoRow>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-elevated p-4">
        <div className="flex items-end justify-between">
          <p className="text-sm font-semibold">Tickets sold</p>
          <p className="text-sm text-muted">{percent}%</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
          <div
            className={`h-full rounded-full ${barTone(percent)}`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          {formatNumber(event.ticketsSold)} of {formatNumber(event.capacity)}{" "}
          seats
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-line bg-elevated p-4">
          <p className="text-xs text-muted">Gross revenue</p>
          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(event.grossRevenue)}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-elevated p-4">
          <p className="text-xs text-muted">Sponsors</p>
          <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
            <Users className="size-4 text-primary" />
            {event.sponsors}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {access.includes("events") && (
          <Button as={Link} to="/events" className="h-11 w-full">
            Open in Events Master
          </Button>
        )}
        {access.includes("gate") && (
          <Button as={Link} to="/gate" variant="ghost" className="h-11 w-full">
            <ScanLine className="size-4" />
            Gate check-in
          </Button>
        )}
      </div>
    </div>
  );
};

const EventDetailCard = ({
  summary,
  stateSlug,
  stateName,
  stateEvents,
  event,
  onSelectState,
  onSelectEvent,
  onBackToList,
}) => {
  const viewKey = event
    ? `event-${event.id}`
    : stateSlug
      ? `state-${stateSlug}`
      : "empty";

  return (
    <div className="h-full overflow-y-auto rounded-3xl border border-line bg-card p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={viewKey}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {event ? (
            <EventView event={event} onBackToList={onBackToList} />
          ) : stateSlug ? (
            <StateView
              stateName={stateName}
              events={stateEvents}
              onSelectEvent={onSelectEvent}
            />
          ) : (
            <EmptyView summary={summary} onSelectState={onSelectState} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EventDetailCard;
