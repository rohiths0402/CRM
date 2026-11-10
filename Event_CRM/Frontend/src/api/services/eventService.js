import { http } from "../httpClient";
import { ENDPOINTS, USE_MOCK } from "../endpoints";
import { mockDelay, mockEvents, mockVenues } from "../../mocks/mockData";
import { mockPromos, mockTiers } from "../../mocks/mockTicketing";
import { mockSponsors } from "../../mocks/mockSponsors";

const LIVE_STATUSES = ["TICKETS_LIVE", "ONGOING"];

const removeWhere = (list, test) => {
  for (let index = list.length - 1; index >= 0; index -= 1) {
    if (test(list[index])) list.splice(index, 1);
  }
};

const releasedSeats = (eventId) =>
  mockTiers
    .filter((tier) => tier.eventId === eventId)
    .reduce((sum, tier) => sum + tier.quota, 0);

const resolveVenue = (payload) => {
  const venue = mockVenues.find((item) => item.id === Number(payload.venueId));
  if (!venue) throw new Error("Select a venue for this event");
  if (Number(payload.capacity) > venue.capacity) {
    throw new Error(
      `${venue.name} is licensed for ${venue.capacity.toLocaleString("en-IN")} people only`,
    );
  }
  return {
    venueId: venue.id,
    venue: venue.name,
    city: venue.city,
    stateSlug: venue.stateSlug,
    lat: venue.lat,
    lng: venue.lng,
  };
};

const ensureVenueFree = (payload, ignoreId) => {
  const clash = mockEvents.find(
    (event) =>
      event.venueId === Number(payload.venueId) &&
      event.date === payload.date &&
      event.id !== ignoreId,
  );
  if (clash)
    throw new Error(
      `${clash.venue} is already booked on this date for ${clash.title}`,
    );
};

const getLocations = async () => {
  if (!USE_MOCK) return http.get(ENDPOINTS.events.locations);
  await mockDelay(500);
  return { events: [...mockEvents] };
};

const list = async () => {
  if (!USE_MOCK) return http.get(ENDPOINTS.events.list);
  await mockDelay(400);
  return { events: [...mockEvents] };
};

const create = async (payload) => {
  if (!USE_MOCK) return http.post(ENDPOINTS.events.list, payload);
  await mockDelay(600);
  const venueFields = resolveVenue(payload);
  ensureVenueFree(payload);
  const event = {
    ...payload,
    ...venueFields,
    id: Math.max(0, ...mockEvents.map((item) => item.id)) + 1,
    status: "DRAFT",
    ticketsSold: 0,
    grossRevenue: 0,
    sponsors: 0,
  };
  mockEvents.unshift(event);
  return event;
};

const update = async (id, payload) => {
  if (!USE_MOCK) return http.put(ENDPOINTS.events.detail(id), payload);
  await mockDelay(600);
  const index = mockEvents.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Event not found");
  const venueFields = resolveVenue(payload);
  ensureVenueFree(payload, id);
  const released = releasedSeats(id);
  if (Number(payload.capacity) < released) {
    throw new Error(
      `Ticket tiers already release ${released.toLocaleString("en-IN")} seats, so capacity cannot be lower`,
    );
  }
  mockEvents[index] = { ...mockEvents[index], ...payload, ...venueFields };
  return mockEvents[index];
};

const updateStatus = async (id, status) => {
  if (!USE_MOCK) return http.patch(ENDPOINTS.events.status(id), { status });
  await mockDelay(250);
  const index = mockEvents.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Event not found");
  mockEvents[index] = { ...mockEvents[index], status };

  if (!LIVE_STATUSES.includes(status)) {
    mockTiers.forEach((tier, tierIndex) => {
      if (tier.eventId === id && tier.status === "ACTIVE") {
        mockTiers[tierIndex] = { ...tier, status: "PAUSED" };
      }
    });
  }

  return mockEvents[index];
};

const remove = async (id) => {
  if (!USE_MOCK) return http.delete(ENDPOINTS.events.detail(id));
  await mockDelay(500);
  const index = mockEvents.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Event not found");
  if (mockEvents[index].ticketsSold > 0) {
    throw new Error(
      "This event has sold tickets. Move it to Wrap instead of deleting it.",
    );
  }
  if (mockSponsors.some((sponsor) => sponsor.eventId === id)) {
    throw new Error(
      "This event has sponsor contracts. Remove them in Sponsors & Partners first.",
    );
  }
  mockEvents.splice(index, 1);
  removeWhere(mockTiers, (tier) => tier.eventId === id);
  removeWhere(mockPromos, (promo) => promo.eventId === id && promo.used === 0);
  return { message: "Event deleted" };
};

export const eventService = {
  getLocations,
  list,
  create,
  update,
  updateStatus,
  remove,
};
