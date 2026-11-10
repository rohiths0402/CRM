import { http } from "../httpClient";
import { ENDPOINTS, USE_MOCK } from "../endpoints";
import { mockDelay, mockEvents, mockVenues } from "../../mocks/mockData";

const withEventCount = (venue) => ({
  ...venue,
  eventsCount: mockEvents.filter((event) => event.venueId === venue.id).length,
});

const findVenueIndex = (id) => {
  const index = mockVenues.findIndex((venue) => venue.id === id);
  if (index < 0) throw new Error("Venue not found");
  return index;
};

const checkZoneRoom = (venue, capacity, ignoreZoneId) => {
  const used = venue.zones
    .filter((zone) => zone.id !== ignoreZoneId)
    .reduce((sum, zone) => sum + zone.capacity, 0);
  const room = venue.capacity - used;
  if (Number(capacity) > room) {
    throw new Error(
      `Only ${room.toLocaleString("en-IN")} seats are left to allocate. The venue is licensed for ${venue.capacity.toLocaleString("en-IN")}.`,
    );
  }
};

const list = async () => {
  if (!USE_MOCK) return http.get(ENDPOINTS.venues.list);
  await mockDelay(400);
  return { venues: mockVenues.map(withEventCount) };
};

const create = async (payload) => {
  if (!USE_MOCK) return http.post(ENDPOINTS.venues.list, payload);
  await mockDelay(600);
  const venue = {
    ...payload,
    id: Math.max(0, ...mockVenues.map((item) => item.id)) + 1,
    zones: [],
  };
  mockVenues.push(venue);
  return withEventCount(venue);
};

const update = async (id, payload) => {
  if (!USE_MOCK) return http.put(ENDPOINTS.venues.detail(id), payload);
  await mockDelay(600);
  const index = findVenueIndex(id);
  const booked = mockEvents.filter((event) => event.venueId === id);
  const biggest = Math.max(0, ...booked.map((event) => event.capacity));
  if (Number(payload.capacity) < biggest) {
    throw new Error(
      `An event here needs ${biggest.toLocaleString("en-IN")} seats, so capacity cannot be lower`,
    );
  }
  const allocated = mockVenues[index].zones.reduce(
    (sum, zone) => sum + zone.capacity,
    0,
  );
  if (Number(payload.capacity) < allocated) {
    throw new Error(
      `Zones already use ${allocated.toLocaleString("en-IN")} seats, so capacity cannot be lower`,
    );
  }
  mockVenues[index] = { ...mockVenues[index], ...payload };
  mockEvents.forEach((event, eventIndex) => {
    if (event.venueId === id) {
      mockEvents[eventIndex] = {
        ...event,
        venue: payload.name,
        city: payload.city,
        stateSlug: payload.stateSlug,
        lat: payload.lat,
        lng: payload.lng,
      };
    }
  });
  return withEventCount(mockVenues[index]);
};

const remove = async (id) => {
  if (!USE_MOCK) return http.delete(ENDPOINTS.venues.detail(id));
  await mockDelay(500);
  const index = findVenueIndex(id);
  const count = mockEvents.filter((event) => event.venueId === id).length;
  if (count > 0) {
    throw new Error(
      `${count} event${count > 1 ? "s are" : " is"} booked at this venue, so it cannot be deleted`,
    );
  }
  mockVenues.splice(index, 1);
  return { message: "Venue deleted" };
};

const addZone = async (venueId, payload) => {
  if (!USE_MOCK) return http.post(ENDPOINTS.venues.zones(venueId), payload);
  await mockDelay(500);
  const index = findVenueIndex(venueId);
  const venue = mockVenues[index];
  checkZoneRoom(venue, payload.capacity);
  const zone = {
    ...payload,
    id: Date.now(),
    sold: 0,
  };
  mockVenues[index] = { ...venue, zones: [...venue.zones, zone] };
  return withEventCount(mockVenues[index]);
};

const updateZone = async (venueId, zoneId, payload) => {
  if (!USE_MOCK)
    return http.put(ENDPOINTS.venues.zone(venueId, zoneId), payload);
  await mockDelay(500);
  const index = findVenueIndex(venueId);
  const venue = mockVenues[index];
  const current = venue.zones.find((zone) => zone.id === zoneId);
  if (!current) throw new Error("Zone not found");
  if (Number(payload.capacity) < current.sold) {
    throw new Error(
      `${current.sold.toLocaleString("en-IN")} tickets are already sold in this zone`,
    );
  }
  checkZoneRoom(venue, payload.capacity, zoneId);
  mockVenues[index] = {
    ...venue,
    zones: venue.zones.map((zone) =>
      zone.id === zoneId ? { ...zone, ...payload } : zone,
    ),
  };
  return withEventCount(mockVenues[index]);
};

const removeZone = async (venueId, zoneId) => {
  if (!USE_MOCK) return http.delete(ENDPOINTS.venues.zone(venueId, zoneId));
  await mockDelay(400);
  const index = findVenueIndex(venueId);
  const venue = mockVenues[index];
  const current = venue.zones.find((zone) => zone.id === zoneId);
  if (!current) throw new Error("Zone not found");
  if (current.sold > 0)
    throw new Error("This zone has tickets sold, so it cannot be removed");
  mockVenues[index] = {
    ...venue,
    zones: venue.zones.filter((zone) => zone.id !== zoneId),
  };
  return withEventCount(mockVenues[index]);
};

export const venueService = {
  list,
  create,
  update,
  remove,
  addZone,
  updateZone,
  removeZone,
};
