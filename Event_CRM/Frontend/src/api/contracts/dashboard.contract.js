export const dashboardContract = {
  summary: {
    method: "GET",
    url: "/dashboard/summary",
    query: {
      eventId: "all | event id. Use all for numbers across every event",
    },
    headers: { Authorization: "Bearer <token>" },
    response: {
      scope: {
        label: "string, for example All 11 events or the event title",
        detail: "string, for example Across 7 states or the venue and city",
      },
      kpis: [
        {
          key: "events | tickets | revenue | sponsors",
          label: "string",
          value: "string, already formatted",
          note: "string",
          progress: "number (0-100, optional, only for tickets)",
        },
      ],
      salesTrend: [
        {
          hour: "string, for example 4 PM",
          tickets: "number, tickets sold in that hour today",
        },
      ],
      liveEvent:
        "event object from /events/locations whose status is ONGOING, or null",
      pendingProposals: {
        count: "number",
        latest: "string",
      },
    },
  },
};
