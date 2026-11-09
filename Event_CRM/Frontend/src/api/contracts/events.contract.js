export const eventsContract = {
  locations: {
    method: "GET",
    url: "/events/locations",
    headers: { Authorization: "Bearer <token>" },
    response: {
      events: [
        {
          id: "number",
          title: "string",
          category:
            "Concert | Awards | Stand-up | Sports | College fest | Film launch",
          status:
            "DRAFT | ANNOUNCED | TICKETS_LIVE | SOLD_OUT | ONGOING | WRAP",
          stateSlug: "string, lowercase with hyphens, for example tamil-nadu",
          city: "string",
          venue: "string",
          lat: "number",
          lng: "number",
          date: "string, YYYY-MM-DD",
          gatesOpen: "string",
          showStart: "string",
          capacity: "number",
          ticketsSold: "number",
          grossRevenue: "number, in rupees",
          sponsors: "number",
          headliner: "string",
        },
      ],
    },
  },
};
