import { DoorOpen, MapPin, Mic2, Moon, Play, Sofa } from "lucide-react";

const Fact = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
      <Icon className="size-4" />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-muted">{label}</p>
      <p className="truncate text-sm font-semibold">{value}</p>
    </div>
  </div>
);

const EventStrip = ({ event, venue, actCount }) => (
  <div className="grid gap-5 rounded-3xl border border-line bg-card p-5 sm:grid-cols-2 xl:grid-cols-6">
    <Fact
      icon={MapPin}
      label="Venue"
      value={venue ? `${venue.name}` : event.venue}
    />
    <Fact icon={DoorOpen} label="Gates open" value={event.gatesOpen} />
    <Fact icon={Play} label="Show starts" value={event.showStart} />
    <Fact icon={Moon} label="Curfew" value={event.curfew} />
    <Fact
      icon={Sofa}
      label="Green rooms"
      value={venue ? venue.greenRooms : "Unknown"}
    />
    <Fact icon={Mic2} label="Acts in lineup" value={actCount} />
  </div>
);

export default EventStrip;
