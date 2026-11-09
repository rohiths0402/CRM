import { Link } from "react-router-dom";
import { DoorOpen, MapPin, Mic2, Play } from "lucide-react";
import Button from "../common/Button";
import SpotlightCard from "../common/SpotlightCard";
import { useAuth } from "../../context/AuthContext";
import { ROLE_ACCESS } from "../../constants/roles";
import { formatNumber } from "../../utils/format";

const Row = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
      <Icon className="size-4" />
    </span>
    {children}
  </div>
);

const LiveEventCard = ({ event, loading }) => {
  const { user } = useAuth();
  const access = ROLE_ACCESS[user.role];

  if (loading)
    return <div className="h-[28rem] animate-pulse rounded-3xl bg-card" />;

  if (!event) {
    return (
      <SpotlightCard className="h-full p-6">
        <p className="text-sm font-semibold text-muted">Happening now</p>
        <p className="mt-6 font-display text-2xl font-semibold">
          No event is live right now
        </p>
        <p className="mt-2 text-sm text-muted">
          When an event goes live, its gates and show timings appear here.
        </p>
      </SpotlightCard>
    );
  }

  const percent = Math.round((event.ticketsSold / event.capacity) * 100);

  return (
    <SpotlightCard className="h-full p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted">Happening now</p>
        <span className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-500">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </div>

      <h3 className="mt-5 font-display text-3xl font-semibold leading-tight">
        {event.title}
      </h3>
      <p className="mt-1 text-sm text-muted">
        {event.category} · {event.city}
      </p>

      <div className="mt-6 space-y-3">
        <Row icon={MapPin}>{event.venue}</Row>
        <Row icon={DoorOpen}>Gates opened at {event.gatesOpen}</Row>
        <Row icon={Play}>Show starts at {event.showStart}</Row>
        <Row icon={Mic2}>{event.headliner}</Row>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-elevated p-4">
        <div className="flex items-end justify-between">
          <p className="text-sm font-semibold">Tickets sold</p>
          <p className="text-sm text-muted">{percent}%</p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          {formatNumber(event.ticketsSold)} of {formatNumber(event.capacity)}{" "}
          seats
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {access.includes("gate") && (
          <Button as={Link} to="/gate" className="h-11 flex-1 px-4">
            View gate turnstile
          </Button>
        )}
        {access.includes("artists") && (
          <Button
            as={Link}
            to="/artists"
            variant="ghost"
            className="h-11 flex-1 px-4"
          >
            Stage call sheet
          </Button>
        )}
      </div>
    </SpotlightCard>
  );
};

export default LiveEventCard;
