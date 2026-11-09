import { useCallback, useMemo, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import EventsMap from "./EventsMap";
import EventDetailCard from "./EventDetailCard";
import { STATE_NAMES } from "../../constants/indiaStates";

const EventsMapSection = ({ events, error }) => {
  const [selectedState, setSelectedState] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const handleSelectState = useCallback((slug) => {
    setSelectedState(slug);
    setSelectedEventId(null);
  }, []);

  const handleSelectEvent = useCallback((id) => setSelectedEventId(id), []);

  const handleBackToIndia = () => {
    setSelectedState(null);
    setSelectedEventId(null);
  };

  const summary = useMemo(() => {
    if (!events) return [];
    const counts = {};
    events.forEach(({ stateSlug }) => {
      counts[stateSlug] = (counts[stateSlug] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([slug, count]) => ({ slug, name: STATE_NAMES[slug], count }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  const stateEvents = useMemo(
    () => (events || []).filter((event) => event.stateSlug === selectedState),
    [events, selectedState],
  );

  const selectedEvent =
    events?.find((event) => event.id === selectedEventId) || null;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-semibold sm:text-3xl">
            Where your events are happening
          </h3>
          <p className="mt-1 text-sm text-muted">
            {events
              ? `${events.length} events in ${summary.length} states. Click a bright state to zoom in, then click a pin for details.`
              : "Loading events"}
          </p>
        </div>

        <nav
          className="flex items-center gap-1 text-sm"
          aria-label="Map location"
        >
          <button
            type="button"
            onClick={handleBackToIndia}
            disabled={!selectedState}
            className={`rounded-full px-3 py-1.5 font-medium transition ${selectedState ? "border border-line bg-elevated hover:border-primary" : "text-foreground"}`}
          >
            All India
          </button>
          {selectedState && (
            <>
              <ChevronRight className="size-4 text-muted" />
              <span className="rounded-full bg-primary/12 px-3 py-1.5 font-semibold text-primary">
                {STATE_NAMES[selectedState]}
              </span>
            </>
          )}
        </nav>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {!error && !events && (
        <div className="grid h-[34rem] place-items-center rounded-3xl border border-line bg-card">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )}

      {events && (
        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="h-[26rem] rounded-3xl border border-line bg-card p-3 sm:h-[34rem]">
            <EventsMap
              events={events}
              selectedState={selectedState}
              selectedEventId={selectedEventId}
              onSelectState={handleSelectState}
              onSelectEvent={handleSelectEvent}
            />
          </div>

          <div className="h-[34rem]">
            <EventDetailCard
              summary={summary}
              stateSlug={selectedState}
              stateName={STATE_NAMES[selectedState]}
              stateEvents={stateEvents}
              event={selectedEvent}
              onSelectState={handleSelectState}
              onSelectEvent={handleSelectEvent}
              onBackToList={() => setSelectedEventId(null)}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default EventsMapSection;
