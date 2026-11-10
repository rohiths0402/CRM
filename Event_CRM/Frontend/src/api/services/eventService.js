import { http } from "../httpClient";
import { ENDPOINTS, USE_MOCK } from "../endpoints";
import { mockDelay, mockEvents, mockVenues } from "../../mocks/mockData";

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
  mockEvents[index] = { ...mockEvents[index], ...payload, ...venueFields };
  return mockEvents[index];
};

const updateStatus = async (id, status) => {
  if (!USE_MOCK) return http.patch(ENDPOINTS.events.status(id), { status });
  await mockDelay(250);
  const index = mockEvents.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Event not found");
  mockEvents[index] = { ...mockEvents[index], status };
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
  mockEvents.splice(index, 1);
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
