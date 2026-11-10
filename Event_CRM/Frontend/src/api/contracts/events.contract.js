const eventShape = {
  id: "number",
  title: "string",
  category: "Concert | Awards | Sports | Stand-up | College fest | Film launch",
  ageRating: "All ages | 13+ | 18+",
  status: "DRAFT | ANNOUNCED | TICKETS_LIVE | SOLD_OUT | ONGOING | WRAP",
  headliner: "string",
  description: "string, optional",
  venueId: "number",
  venue: "string, venue name",
  city: "string",
  stateSlug: "string, lowercase with hyphens, for example tamil-nadu",
  lat: "number",
  lng: "number",
  date: "string, YYYY-MM-DD",
  gatesOpen: "string, for example 05:30 PM",
  showStart: "string, for example 07:00 PM",
  curfew: "string, for example 11:00 PM",
  capacity: "number, seats made available for this event",
  ticketsSold: "number",
  grossRevenue: "number, in rupees",
  sponsors: "number",
  budget: "number, target production budget in rupees",
  projectedRevenue: "number, in rupees",
  bannerUrl: "string, image url or empty",
};

const eventInput = {
  title: "string",
  category: "string",
  ageRating: "string",
  headliner: "string",
  description: "string, optional",
  bannerUrl: "string, optional",
  venueId: "number",
  date: "string, YYYY-MM-DD",
  gatesOpen: "string, for example 05:30 PM",
  showStart: "string",
  curfew: "string",
  capacity: "number, cannot be more than the venue licensed capacity",
  budget: "number",
  projectedRevenue: "number",
};

export const eventsContract = {
  locations: {
    method: "GET",
    url: "/events/locations",
    headers: { Authorization: "Bearer <token>" },
    response: { events: [eventShape] },
  },

  list: {
    method: "GET",
    url: "/events",
    headers: { Authorization: "Bearer <token>" },
    response: { events: [eventShape] },
  },

  create: {
    method: "POST",
    url: "/events",
    request: eventInput,
    response: eventShape,
    note: "New events start with status DRAFT",
    errors: {
      400: "Capacity is more than the venue licensed capacity",
      409: "Venue is already booked on this date",
    },
  },

  update: {
    method: "PUT",
    url: "/events/{id}",
    request: eventInput,
    response: eventShape,
    errors: {
      404: "Event not found",
      409: "Venue is already booked on this date",
    },
  },

  updateStatus: {
    method: "PATCH",
    url: "/events/{id}/status",
    request: {
      status: "DRAFT | ANNOUNCED | TICKETS_LIVE | SOLD_OUT | ONGOING | WRAP",
    },
    response: eventShape,
  },

  remove: {
    method: "DELETE",
    url: "/events/{id}",
    role: "ADMIN only",
    errors: {
      409: "Event has sold tickets, move it to WRAP instead of deleting",
    },
  },
};
