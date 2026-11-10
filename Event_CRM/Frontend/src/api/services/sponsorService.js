import { http } from "../httpClient";
import { ENDPOINTS, USE_MOCK } from "../endpoints";
import { mockDelay, mockEvents } from "../../mocks/mockData";
import {
  buildDeliverables,
  mockSponsors,
  syncSponsorCounts,
} from "../../mocks/mockSponsors";
import { SPONSOR_TIERS, paymentStatusFor } from "../../constants/sponsors";

const money = (value) => `₹ ${value.toLocaleString("en-IN")}`;

const withEvent = (sponsor) => {
  const event = mockEvents.find((item) => item.id === sponsor.eventId);
  return {
    ...sponsor,
    eventTitle: event?.title || "Deleted event",
    eventDate: event?.date || "",
    eventStatus: event?.status || "WRAP",
    paymentStatus: paymentStatusFor(
      sponsor.amountReceived,
      sponsor.contractValue,
    ),
  };
};

const findEvent = (eventId) => {
  const event = mockEvents.find((item) => item.id === Number(eventId));
  if (!event) throw new Error("Event not found");
  return event;
};

const locate = (id) => {
  const index = mockSponsors.findIndex((sponsor) => sponsor.id === id);
  if (index < 0) throw new Error("Sponsor not found");
  return index;
};

const checkSponsor = (payload, event, ignoreId) => {
  const others = mockSponsors.filter(
    (sponsor) => sponsor.eventId === event.id && sponsor.id !== ignoreId,
  );

  if (
    others.some(
      (sponsor) =>
        sponsor.brandName.toLowerCase() ===
        payload.brandName.trim().toLowerCase(),
    )
  ) {
    throw new Error(
      `${payload.brandName.trim()} is already a sponsor of ${event.title}`,
    );
  }

  const limit = SPONSOR_TIERS[payload.tier].limit;
  if (
    limit !== null &&
    others.filter((sponsor) => sponsor.tier === payload.tier).length >= limit
  ) {
    throw new Error(
      `${event.title} already has the maximum of ${limit} ${SPONSOR_TIERS[payload.tier].label}`,
    );
  }

  if (Number(payload.amountReceived) > Number(payload.contractValue)) {
    throw new Error(
      `Amount received cannot be more than the contract value, ${money(Number(payload.contractValue))}`,
    );
  }
};

const checkDeliverable = (payload, sponsor) => {
  const event = findEvent(sponsor.eventId);
  if (payload.dueDate > event.date) {
    throw new Error("The due date must be on or before the event date");
  }
};

const list = async () => {
  if (!USE_MOCK) return http.get(ENDPOINTS.sponsors.list);
  await mockDelay(400);
  return { sponsors: mockSponsors.map(withEvent) };
};

const create = async (payload) => {
  if (!USE_MOCK) return http.post(ENDPOINTS.sponsors.list, payload);
  await mockDelay(700);
  const { addStandardDeliverables, ...fields } = payload;
  const event = findEvent(fields.eventId);
  if (event.status === "WRAP")
    throw new Error("This event is wrapped, so no new sponsors can be added");
  checkSponsor(fields, event);

  const id = Math.max(0, ...mockSponsors.map((sponsor) => sponsor.id)) + 1;
  const sponsor = {
    ...fields,
    brandName: fields.brandName.trim(),
    id,
    deliverables: addStandardDeliverables
      ? buildDeliverables(id, fields.tier, event.date, 0)
      : [],
  };

  mockSponsors.unshift(sponsor);
  syncSponsorCounts();
  return withEvent(sponsor);
};

const update = async (id, payload) => {
  if (!USE_MOCK) return http.put(ENDPOINTS.sponsors.detail(id), payload);
  await mockDelay(600);
  const index = locate(id);
  const current = mockSponsors[index];
  const { addStandardDeliverables, ...fields } = payload;
  const event = findEvent(current.eventId);
  checkSponsor({ ...fields, eventId: current.eventId }, event, id);

  mockSponsors[index] = {
    ...current,
    ...fields,
    brandName: fields.brandName.trim(),
    eventId: current.eventId,
    deliverables: current.deliverables,
  };
  return withEvent(mockSponsors[index]);
};

const remove = async (id) => {
  if (!USE_MOCK) return http.delete(ENDPOINTS.sponsors.detail(id));
  await mockDelay(500);
  const index = locate(id);
  if (mockSponsors[index].amountReceived > 0) {
    throw new Error(
      "Payment is already received from this sponsor, so it cannot be deleted",
    );
  }
  mockSponsors.splice(index, 1);
  syncSponsorCounts();
  return { message: "Sponsor deleted" };
};

const addDeliverable = async (sponsorId, payload) => {
  if (!USE_MOCK)
    return http.post(ENDPOINTS.sponsors.deliverables(sponsorId), payload);
  await mockDelay(400);
  const index = locate(sponsorId);
  const sponsor = mockSponsors[index];
  checkDeliverable(payload, sponsor);

  const deliverable = {
    id: Date.now(),
    text: payload.text.trim(),
    dueDate: payload.dueDate,
    status: "PENDING",
  };
  mockSponsors[index] = {
    ...sponsor,
    deliverables: [...sponsor.deliverables, deliverable],
  };
  return withEvent(mockSponsors[index]);
};

const updateDeliverable = async (sponsorId, deliverableId, payload) => {
  if (!USE_MOCK)
    return http.put(
      ENDPOINTS.sponsors.deliverable(sponsorId, deliverableId),
      payload,
    );
  await mockDelay(400);
  const index = locate(sponsorId);
  const sponsor = mockSponsors[index];
  checkDeliverable(payload, sponsor);

  mockSponsors[index] = {
    ...sponsor,
    deliverables: sponsor.deliverables.map((item) =>
      item.id === deliverableId
        ? { ...item, text: payload.text.trim(), dueDate: payload.dueDate }
        : item,
    ),
  };
  return withEvent(mockSponsors[index]);
};

const setDeliverableStatus = async (sponsorId, deliverableId, status) => {
  if (!USE_MOCK)
    return http.patch(
      ENDPOINTS.sponsors.deliverable(sponsorId, deliverableId),
      { status },
    );
  await mockDelay(250);
  const index = locate(sponsorId);
  const sponsor = mockSponsors[index];
  mockSponsors[index] = {
    ...sponsor,
    deliverables: sponsor.deliverables.map((item) =>
      item.id === deliverableId ? { ...item, status } : item,
    ),
  };
  return withEvent(mockSponsors[index]);
};

const removeDeliverable = async (sponsorId, deliverableId) => {
  if (!USE_MOCK)
    return http.delete(
      ENDPOINTS.sponsors.deliverable(sponsorId, deliverableId),
    );
  await mockDelay(400);
  const index = locate(sponsorId);
  const sponsor = mockSponsors[index];
  mockSponsors[index] = {
    ...sponsor,
    deliverables: sponsor.deliverables.filter(
      (item) => item.id !== deliverableId,
    ),
  };
  return withEvent(mockSponsors[index]);
};

export const sponsorService = {
  list,
  create,
  update,
  remove,
  addDeliverable,
  updateDeliverable,
  setDeliverableStatus,
  removeDeliverable,
};
