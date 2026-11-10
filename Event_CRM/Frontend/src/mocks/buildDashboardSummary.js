import { mockEvents, mockPendingProposals } from "./mockData";
import { EVENT_STATUS } from "../constants/eventStatus";
import { formatCurrency, formatDate, formatNumber } from "../utils/format";

const HOURS = [
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
  "6 PM",
  "7 PM",
  "8 PM",
];
const HOUR_WEIGHTS = [3, 5, 7, 9, 8, 10, 12, 14, 13, 16, 18, 15];
const SHARE_SOLD_TODAY = 0.04;

const buildTrend = (ticketsToday) => {
  const totalWeight = HOUR_WEIGHTS.reduce((sum, weight) => sum + weight, 0);
  return HOURS.map((hour, index) => ({
    hour,
    tickets: Math.round((ticketsToday * HOUR_WEIGHTS[index]) / totalWeight),
  }));
};

export const buildDashboardSummary = (eventId) => {
  const events = [...mockEvents];
  const selected =
    eventId === "all"
      ? null
      : events.find((event) => String(event.id) === String(eventId));
  const scoped = selected ? [selected] : events;

  const total = (key) => scoped.reduce((sum, event) => sum + event[key], 0);
  const stateCount = new Set(scoped.map((event) => event.stateSlug)).size;
  const sold = total("ticketsSold");
  const capacity = total("capacity");

  return {
    scope: {
      label: selected ? selected.title : `All ${events.length} events`,
      detail: selected
        ? `${selected.venue}, ${selected.city}`
        : `Across ${stateCount} states`,
    },
    kpis: [
      selected
        ? {
            key: "events",
            label: "Event date",
            value: formatDate(selected.date),
            note: `Status: ${EVENT_STATUS[selected.status].label}`,
          }
        : {
            key: "events",
            label: "Total events",
            value: String(scoped.length),
            note: `Running across ${stateCount} states`,
          },
      {
        key: "tickets",
        label: "Tickets sold",
        value: formatNumber(sold),
        note: `Out of ${formatNumber(capacity)} seats available`,
        progress: capacity ? Math.round((sold / capacity) * 100) : 0,
      },
      {
        key: "revenue",
        label: "Ticket revenue",
        value: formatCurrency(total("grossRevenue")),
        note: "Money earned from ticket sales",
      },
      {
        key: "sponsors",
        label: "Brand sponsors",
        value: String(total("sponsors")),
        note: "Sponsor deals signed",
      },
    ],
    salesTrend: buildTrend(Math.round(sold * SHARE_SOLD_TODAY)),
    liveEvent: events.find((event) => event.status === "ONGOING") || null,
    pendingProposals: mockPendingProposals,
  };
};
