import { http } from "../httpClient";
import { ENDPOINTS, USE_MOCK } from "../endpoints";
import { mockDelay, mockEvents } from "../../mocks/mockData";
import { mockPromos, mockTiers } from "../../mocks/mockTicketing";

const LIVE_STATUSES = ["TICKETS_LIVE", "ONGOING"];
const todayIso = () => new Date().toLocaleDateString("en-CA");
const seats = (value) => value.toLocaleString("en-IN");

const withEvent = (tier) => {
  const event = mockEvents.find((item) => item.id === tier.eventId);
  return {
    ...tier,
    eventTitle: event?.title || "Deleted event",
    eventStatus: event?.status || "WRAP",
  };
};

const findEvent = (eventId) => {
  const event = mockEvents.find((item) => item.id === Number(eventId));
  if (!event) throw new Error("Event not found");
  return event;
};

const findTierIndex = (id) => {
  const index = mockTiers.findIndex((tier) => tier.id === id);
  if (index < 0) throw new Error("Ticket tier not found");
  return index;
};

const findPromoIndex = (id) => {
  const index = mockPromos.findIndex((promo) => promo.id === id);
  if (index < 0) throw new Error("Promo code not found");
  return index;
};

const checkTier = (payload, event, ignoreId) => {
  if (event.status === "WRAP")
    throw new Error("This event is wrapped, so its tiers cannot be changed");

  const name = payload.name.trim().toLowerCase();
  const clash = mockTiers.find(
    (tier) =>
      tier.eventId === event.id &&
      tier.id !== ignoreId &&
      tier.name.toLowerCase() === name,
  );
  if (clash)
    throw new Error(`${event.title} already has a tier called ${clash.name}`);

  const others = mockTiers
    .filter((tier) => tier.eventId === event.id && tier.id !== ignoreId)
    .reduce((sum, tier) => sum + tier.quota, 0);
  const room = event.capacity - others;
  if (Number(payload.quota) > room) {
    throw new Error(
      `Only ${seats(room)} seats are left to release for this event`,
    );
  }
};

const checkPromo = (payload, ignoreId) => {
  const code = payload.code.trim().toUpperCase();
  if (
    mockPromos.some((promo) => promo.code === code && promo.id !== ignoreId)
  ) {
    throw new Error("This promo code already exists");
  }

  if (payload.discountType === "FLAT") {
    const prices = mockTiers
      .filter(
        (tier) => payload.eventId === null || tier.eventId === payload.eventId,
      )
      .map((tier) => tier.price);
    if (prices.length && Number(payload.value) >= Math.min(...prices)) {
      throw new Error(
        `A flat discount must be lower than the cheapest ticket, ₹ ${seats(Math.min(...prices))}`,
      );
    }
  }
};

const listTiers = async () => {
  if (!USE_MOCK) return http.get(ENDPOINTS.ticketing.tiers);
  await mockDelay(400);
  return { tiers: mockTiers.map(withEvent) };
};

const createTier = async (payload) => {
  if (!USE_MOCK) return http.post(ENDPOINTS.ticketing.tiers, payload);
  await mockDelay(600);
  const event = findEvent(payload.eventId);
  checkTier(payload, event);
  const tier = {
    ...payload,
    id: Math.max(0, ...mockTiers.map((item) => item.id)) + 1,
    sold: 0,
    status: "PAUSED",
  };
  mockTiers.push(tier);
  return withEvent(tier);
};

const updateTier = async (id, payload) => {
  if (!USE_MOCK) return http.put(ENDPOINTS.ticketing.tier(id), payload);
  await mockDelay(600);
  const index = findTierIndex(id);
  const current = mockTiers[index];
  const event = findEvent(current.eventId);

  if (current.sold > 0 && Number(payload.price) !== current.price) {
    throw new Error(
      "The price is locked because tickets are already sold. Pause this tier and create the next phase.",
    );
  }
  if (Number(payload.quota) < current.sold) {
    throw new Error(
      `${seats(current.sold)} tickets are already sold, so the quota cannot be lower`,
    );
  }
  checkTier({ ...payload, eventId: current.eventId }, event, id);

  let status = current.status;
  if (Number(payload.quota) <= current.sold) status = "SOLD_OUT";
  else if (current.status === "SOLD_OUT") status = "PAUSED";

  mockTiers[index] = {
    ...current,
    ...payload,
    eventId: current.eventId,
    sold: current.sold,
    status,
  };
  return withEvent(mockTiers[index]);
};

const setTierStatus = async (id, status) => {
  if (!USE_MOCK)
    return http.patch(ENDPOINTS.ticketing.tierStatus(id), { status });
  await mockDelay(250);
  const index = findTierIndex(id);
  const current = mockTiers[index];
  const event = findEvent(current.eventId);

  if (current.status === "SOLD_OUT")
    throw new Error("A sold out tier cannot be switched on");
  if (status === "ACTIVE" && !LIVE_STATUSES.includes(event.status)) {
    throw new Error(
      "Move the event to Tickets live in Events Master before putting a tier on sale",
    );
  }

  mockTiers[index] = { ...current, status };
  return withEvent(mockTiers[index]);
};

const removeTier = async (id) => {
  if (!USE_MOCK) return http.delete(ENDPOINTS.ticketing.tier(id));
  await mockDelay(500);
  const index = findTierIndex(id);
  if (mockTiers[index].sold > 0) {
    throw new Error(
      "This tier has sold tickets, so it cannot be deleted. Pause it instead.",
    );
  }
  mockTiers.splice(index, 1);
  return { message: "Tier deleted" };
};

const listPromos = async () => {
  if (!USE_MOCK) return http.get(ENDPOINTS.ticketing.promos);
  await mockDelay(400);
  return { promos: [...mockPromos] };
};

const createPromo = async (payload) => {
  if (!USE_MOCK) return http.post(ENDPOINTS.ticketing.promos, payload);
  await mockDelay(600);
  checkPromo(payload);
  if (payload.expiresOn < todayIso())
    throw new Error("The expiry date cannot be in the past");
  const promo = {
    ...payload,
    code: payload.code.trim().toUpperCase(),
    id: Math.max(0, ...mockPromos.map((item) => item.id)) + 1,
    used: 0,
    enabled: true,
  };
  mockPromos.unshift(promo);
  return promo;
};

const updatePromo = async (id, payload) => {
  if (!USE_MOCK) return http.put(ENDPOINTS.ticketing.promo(id), payload);
  await mockDelay(600);
  const index = findPromoIndex(id);
  const current = mockPromos[index];

  if (current.used > 0 && payload.code.trim().toUpperCase() !== current.code) {
    throw new Error(
      "The code cannot change because customers have already used it",
    );
  }
  if (Number(payload.maxUses) < current.used) {
    throw new Error(
      `${seats(current.used)} uses are already counted, so the limit cannot be lower`,
    );
  }
  checkPromo(payload, id);

  mockPromos[index] = {
    ...current,
    ...payload,
    code: payload.code.trim().toUpperCase(),
    used: current.used,
    enabled: current.enabled,
  };
  return mockPromos[index];
};

const setPromoEnabled = async (id, enabled) => {
  if (!USE_MOCK)
    return http.patch(ENDPOINTS.ticketing.promoStatus(id), { enabled });
  await mockDelay(250);
  const index = findPromoIndex(id);
  mockPromos[index] = { ...mockPromos[index], enabled };
  return mockPromos[index];
};

const removePromo = async (id) => {
  if (!USE_MOCK) return http.delete(ENDPOINTS.ticketing.promo(id));
  await mockDelay(500);
  const index = findPromoIndex(id);
  if (mockPromos[index].used > 0) {
    throw new Error(
      "Customers have used this code, so it cannot be deleted. Disable it instead.",
    );
  }
  mockPromos.splice(index, 1);
  return { message: "Promo code deleted" };
};

export const ticketService = {
  listTiers,
  createTier,
  updateTier,
  setTierStatus,
  removeTier,
  listPromos,
  createPromo,
  updatePromo,
  setPromoEnabled,
  removePromo,
};
