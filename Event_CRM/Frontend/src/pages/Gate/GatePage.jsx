import { useCallback, useEffect, useRef, useState } from "react";
import { ScanLine, Ticket } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import { SelectField } from "../../components/common/FormControls";
import GateStatusBanner from "../../components/gate/GateStatusBanner";
import GateCounters from "../../components/gate/GateCounters";
import TierProgress from "../../components/gate/TierProgress";
import RecentCheckIns from "../../components/gate/RecentCheckIns";
import GateSearch from "../../components/gate/GateSearch";
import SearchResults from "../../components/gate/SearchResults";
import AttendeeCard from "../../components/gate/AttendeeCard";
import { useAuth } from "../../context/AuthContext";
import { eventService } from "../../api/services/eventService";
import { gateService } from "../../api/services/gateService";
import { EVENT_STATUS } from "../../constants/eventStatus";
import { GATES, GATE_ERROR } from "../../constants/gate";
import { ROLES } from "../../constants/roles";

const GatePage = () => {
  const { user } = useAuth();
  const searchRef = useRef(null);
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");
  const [eventId, setEventId] = useState("");
  const [summary, setSummary] = useState(null);
  const [gate, setGate] = useState("any");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [justId, setJustId] = useState(null);
  const [problem, setProblem] = useState(null);
  const [busy, setBusy] = useState(false);
  const [undoOpen, setUndoOpen] = useState(false);
  const [undoing, setUndoing] = useState(false);

  const canUndo = user.role === ROLES.ADMIN;
  const event = events?.find((item) => String(item.id) === eventId) || null;

  useEffect(() => {
    eventService
      .list()
      .then(({ events: list }) => {
        const sellable = list.filter((item) => item.ticketsSold > 0);
        setEvents(sellable);
        const start =
          sellable.find((item) => item.status === "ONGOING") || sellable[0];
        setEventId(start ? String(start.id) : "");
      })
      .catch((err) => setError(err.message));
  }, []);

  const loadSummary = useCallback(async () => {
    if (!eventId) return;
    try {
      setSummary(await gateService.getSummary(eventId));
    } catch (err) {
      toast.error(err.message);
    }
  }, [eventId]);

  useEffect(() => {
    setSummary(null);
    loadSummary();
    const timer = setInterval(loadSummary, 20000);
    return () => clearInterval(timer);
  }, [loadSummary]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 3 || !eventId) {
      setResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    let ignore = false;

    const timer = setTimeout(async () => {
      try {
        const { tickets } = await gateService.searchTickets(eventId, term);
        if (ignore) return;
        setResults(tickets);
        const exact = tickets.find(
          (ticket) => ticket.code.toLowerCase() === term.toLowerCase(),
        );
        if (exact) setSelected(exact);
      } catch (err) {
        if (!ignore) toast.error(err.message);
      } finally {
        if (!ignore) setSearching(false);
      }
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query, eventId]);

  const handleQueryChange = (value) => {
    setQuery(value);
    setSelected(null);
    setProblem(null);
    setJustId(null);
  };

  const changeEvent = (change) => {
    setEventId(change.target.value);
    setQuery("");
    setResults(null);
    setSelected(null);
    setProblem(null);
    setJustId(null);
  };

  const pickTicket = (ticket) => {
    setSelected(ticket);
    setProblem(null);
    setJustId(null);
  };

  const applyTicket = (ticket) => {
    setSelected(ticket);
    setResults((list) =>
      list ? list.map((item) => (item.id === ticket.id ? ticket : item)) : list,
    );
  };

  const nextGuest = () => {
    setQuery("");
    setResults(null);
    setSelected(null);
    setProblem(null);
    setJustId(null);
    searchRef.current?.focus();
  };

  const runCheckIn = async (override) => {
    setBusy(true);
    setProblem(null);
    try {
      const updated = await gateService.checkIn(selected.id, {
        gate: gate === "any" ? null : gate,
        overrideGate: override,
      });
      applyTicket(updated);
      setJustId(updated.id);
      toast.success(`${updated.holderName} checked in`);
      loadSummary();
    } catch (err) {
      if (err.data?.ticket) applyTicket(err.data.ticket);
      setProblem({ code: err.code, message: err.message });
      if (
        err.code === GATE_ERROR.ALREADY_CHECKED_IN ||
        err.code === GATE_ERROR.TICKET_CANCELLED
      )
        loadSummary();
    } finally {
      setBusy(false);
    }
  };

  const confirmUndo = async () => {
    setUndoing(true);
    try {
      applyTicket(await gateService.undoCheckIn(selected.id));
      setJustId(null);
      toast.success("Check-in undone");
      loadSummary();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUndoing(false);
      setUndoOpen(false);
    }
  };

  const closeUndo = useCallback(() => setUndoOpen(false), []);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Gate Check-In"
        description="Find the guest, check the details and let them in. Counters update on every entry."
      />

      {error && (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
          {error}
        </p>
      )}

      {!error && !events && (
        <div className="space-y-4">
          <div className="h-12 animate-pulse rounded-2xl bg-card" />
          <div className="h-56 animate-pulse rounded-3xl bg-card" />
        </div>
      )}

      {events && !event && (
        <EmptyState
          icon={Ticket}
          title="No tickets sold yet"
          text="Check-in needs sold tickets. Put a tier on sale in Ticketing & Tiers and come back."
        />
      )}

      {events && event && (
        <>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="lg:w-[28rem]">
              <SelectField
                label="Event"
                value={eventId}
                onChange={changeEvent}
                options={events.map((item) => ({
                  value: String(item.id),
                  label: `${item.title} · ${EVENT_STATUS[item.status].label}`,
                }))}
              />
            </div>

            <div>
              <p className="mb-1.5 text-sm font-medium">You are standing at</p>
              <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-card p-1">
                {["any", ...GATES].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setGate(item)}
                    className={`h-10 rounded-lg px-4 text-sm font-medium transition ${
                      gate === item
                        ? "bg-elevated text-primary shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {item === "any" ? "Any gate" : item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!summary && (
            <div className="space-y-4">
              <div className="h-14 animate-pulse rounded-2xl bg-card" />
              <div className="h-64 animate-pulse rounded-3xl bg-card" />
            </div>
          )}

          {summary && (
            <>
              <GateStatusBanner open={summary.gateOpen} status={event.status} />
              <GateCounters summary={summary} />

              <div className="grid items-start gap-5 xl:grid-cols-[1.15fr_1fr]">
                <section className="space-y-4">
                  <GateSearch
                    value={query}
                    onChange={handleQueryChange}
                    loading={searching}
                    inputRef={searchRef}
                    example={`TCK-${event.id}00001`}
                  />

                  {results && !selected && (
                    <SearchResults
                      results={results}
                      selectedId={null}
                      onSelect={pickTicket}
                    />
                  )}

                  {results && selected && results.length > 1 && (
                    <SearchResults
                      results={results}
                      selectedId={selected.id}
                      onSelect={pickTicket}
                    />
                  )}

                  {selected && (
                    <AttendeeCard
                      ticket={selected}
                      problem={problem}
                      gate={gate}
                      gateOpen={summary.gateOpen}
                      justCheckedIn={justId === selected.id}
                      canUndo={canUndo}
                      busy={busy}
                      onCheckIn={runCheckIn}
                      onUndo={() => setUndoOpen(true)}
                      onNext={nextGuest}
                    />
                  )}

                  {!results && !selected && (
                    <div className="grid place-items-center rounded-3xl border border-dashed border-line bg-card px-6 py-14 text-center">
                      <span className="grid size-14 place-items-center rounded-2xl bg-primary/12 text-primary">
                        <ScanLine className="size-7" />
                      </span>
                      <p className="mt-4 font-display text-2xl font-semibold">
                        Ready for the next guest
                      </p>
                      <p className="mt-2 max-w-sm text-sm text-muted">
                        Type the guest name, mobile number or ticket code above.
                        The guest details appear here.
                      </p>
                    </div>
                  )}
                </section>

                <section className="space-y-5">
                  <TierProgress tiers={summary.tiers} />
                  <RecentCheckIns
                    entries={summary.recent}
                    onSelect={pickTicket}
                  />
                </section>
              </div>
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={undoOpen}
        onClose={closeUndo}
        title="Undo this check-in?"
        message={
          selected
            ? `${selected.holderName} will be marked as not arrived and the inside count goes down by one. Use this only to correct a wrong tap.`
            : ""
        }
        confirmLabel="Undo check-in"
        loading={undoing}
        onConfirm={confirmUndo}
      />
    </div>
  );
};

export default GatePage;
