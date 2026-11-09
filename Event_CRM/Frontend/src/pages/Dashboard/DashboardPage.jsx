import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import KpiGrid from "../../components/dashboard/KpiGrid";
import SalesChart from "../../components/dashboard/SalesChart";
import LiveEventCard from "../../components/dashboard/LiveEventCard";
import ProposalsBanner from "../../components/dashboard/ProposalsBanner";
import EventScopeSelect from "../../components/dashboard/EventScopeSelect";
import EventsMapSection from "../../components/dashboard/EventsMapSection";
import { useAuth } from "../../context/AuthContext";
import { dashboardService } from "../../api/services/dashboardService";
import { eventService } from "../../api/services/eventService";

const DashboardPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState(null);
  const [eventsError, setEventsError] = useState("");
  const [eventId, setEventId] = useState("all");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    eventService
      .getLocations()
      .then((result) => setEvents(result.events))
      .catch((err) => setEventsError(err.message));
  }, []);

  useEffect(() => {
    let ignore = false;
    dashboardService.getSummary(eventId).then((result) => {
      if (!ignore) setSummary(result);
    });
    return () => {
      ignore = true;
    };
  }, [eventId]);

  const handleScopeChange = (id) => {
    setSummary(null);
    setEventId(id);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-end justify-between gap-5"
      >
        <div>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Welcome, {user.name.split(" ")[0]}
          </h2>
          <p className="mt-1 text-muted">
            Here is how your events are doing today.
          </p>
        </div>
        {events && (
          <EventScopeSelect
            events={events}
            value={eventId}
            onChange={handleScopeChange}
          />
        )}
      </motion.div>

      <ProposalsBanner data={summary?.pendingProposals} />

      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Performance</h3>
          <p className="mt-1 text-sm text-muted">
            {summary
              ? `Showing numbers for ${summary.scope.label} · ${summary.scope.detail}`
              : "Loading numbers"}
          </p>
        </div>

        <KpiGrid kpis={summary?.kpis} />

        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <SalesChart data={summary?.salesTrend} scope={summary?.scope} />
          <LiveEventCard event={summary?.liveEvent} loading={!summary} />
        </div>
      </section>

      <EventsMapSection events={events} error={eventsError} />
    </div>
  );
};

export default DashboardPage;
