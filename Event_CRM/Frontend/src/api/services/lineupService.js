import { http } from "../httpClient";
import { ENDPOINTS, USE_MOCK } from "../endpoints";
import { mockDelay, mockEvents, mockVenues } from "../../mocks/mockData";
import { buildRiderItems, mockSlots } from "../../mocks/mockLineups";
import { findSlotProblems } from "../../utils/lineupRules";

const PHONE = /^[6-9]\d{9}$/;

const locate = (id) => {
  const index = mockSlots.findIndex((slot) => slot.id === id);
  if (index < 0) throw new Error("Lineup slot not found");
  return index;
};

const findEvent = (eventId) => {
  const event = mockEvents.find((item) => item.id === Number(eventId));
  if (!event) throw new Error("Event not found");
  return event;
};

const assertEditable = (event) => {
  if (event.status === "WRAP")
    throw new Error("This event is wrapped, so its lineup is locked");
};

const assertManager = (fields) => {
  const hasName = fields.managerName.trim().length >= 2;
  const hasPhone = PHONE.test(fields.managerPhone.trim());

  if (fields.status === "CONFIRMED" && !(hasName && hasPhone)) {
    throw new Error(
      "A confirmed artist needs a manager name and a 10 digit mobile number",
    );
  }
  if (fields.managerPhone.trim() && !hasPhone) {
    throw new Error("Enter a 10 digit mobile number for the manager");
  }
};

const assertValid = (fields, event, ignoreId) => {
  const problems = findSlotProblems(fields, {
    event,
    venue: mockVenues.find((item) => item.id === event.venueId),
    slots: mockSlots,
    ignoreId,
  });
  const first = Object.values(problems)[0];
  if (first) throw new Error(first);

  if (Number(fields.advancePaid) > Number(fields.fee)) {
    throw new Error("The advance cannot be more than the fee");
  }
  assertManager(fields);
};

const list = async () => {
  if (!USE_MOCK) return http.get(ENDPOINTS.lineups.list);
  await mockDelay(400);
  return { slots: [...mockSlots] };
};

const create = async (payload) => {
  if (!USE_MOCK) return http.post(ENDPOINTS.lineups.list, payload);
  await mockDelay(600);
  const { addStandardRider, ...fields } = payload;
  const event = findEvent(fields.eventId);
  assertEditable(event);
  assertValid(fields, event);

  const id = Math.max(0, ...mockSlots.map((slot) => slot.id)) + 1;
  const slot = {
    ...fields,
    id,
    artistName: fields.artistName.trim(),
    stage: fields.stage.trim(),
    managerEmail: "",
    dietaryNotes: "",
    soundRigNotes: "",
    securityNotes: "",
    escortRequired: false,
    riderItems: addStandardRider ? buildRiderItems(id, 0) : [],
  };
  mockSlots.push(slot);
  return slot;
};

const update = async (id, payload) => {
  if (!USE_MOCK) return http.put(ENDPOINTS.lineups.detail(id), payload);
  await mockDelay(600);
  const index = locate(id);
  const current = mockSlots[index];
  const event = findEvent(current.eventId);
  assertEditable(event);
  const { addStandardRider, ...fields } = payload;
  assertValid({ ...fields, eventId: current.eventId }, event, id);

  mockSlots[index] = {
    ...current,
    ...fields,
    artistName: fields.artistName.trim(),
    stage: fields.stage.trim(),
    eventId: current.eventId,
    riderItems: current.riderItems,
  };
  return mockSlots[index];
};

const remove = async (id) => {
  if (!USE_MOCK) return http.delete(ENDPOINTS.lineups.detail(id));
  await mockDelay(500);
  const index = locate(id);
  assertEditable(findEvent(mockSlots[index].eventId));
  if (mockSlots[index].advancePaid > 0) {
    throw new Error(
      "An advance is already paid to this artist. Mark the slot as cancelled instead of deleting it.",
    );
  }
  mockSlots.splice(index, 1);
  return { message: "Slot deleted" };
};

const updateRider = async (id, payload) => {
  if (!USE_MOCK) return http.put(ENDPOINTS.lineups.rider(id), payload);
  await mockDelay(500);
  const index = locate(id);
  const current = mockSlots[index];
  assertEditable(findEvent(current.eventId));
  assertManager({ ...current, ...payload });

  mockSlots[index] = { ...current, ...payload };
  return mockSlots[index];
};

const addRiderItem = async (id, payload) => {
  if (!USE_MOCK) return http.post(ENDPOINTS.lineups.riderItems(id), payload);
  await mockDelay(350);
  const index = locate(id);
  const current = mockSlots[index];
  assertEditable(findEvent(current.eventId));

  const label = payload.label.trim();
  if (
    current.riderItems.some(
      (item) => item.label.toLowerCase() === label.toLowerCase(),
    )
  ) {
    throw new Error("This item is already on the rider list");
  }

  const item = {
    id: Date.now(),
    label,
    category: payload.category,
    status: "PENDING",
  };
  mockSlots[index] = { ...current, riderItems: [...current.riderItems, item] };
  return mockSlots[index];
};

const setRiderItemStatus = async (id, itemId, status) => {
  if (!USE_MOCK)
    return http.patch(ENDPOINTS.lineups.riderItem(id, itemId), { status });
  await mockDelay(250);
  const index = locate(id);
  const current = mockSlots[index];
  assertEditable(findEvent(current.eventId));

  mockSlots[index] = {
    ...current,
    riderItems: current.riderItems.map((item) =>
      item.id === itemId ? { ...item, status } : item,
    ),
  };
  return mockSlots[index];
};

const removeRiderItem = async (id, itemId) => {
  if (!USE_MOCK) return http.delete(ENDPOINTS.lineups.riderItem(id, itemId));
  await mockDelay(350);
  const index = locate(id);
  const current = mockSlots[index];
  assertEditable(findEvent(current.eventId));

  mockSlots[index] = {
    ...current,
    riderItems: current.riderItems.filter((item) => item.id !== itemId),
  };
  return mockSlots[index];
};

export const lineupService = {
  list,
  create,
  update,
  remove,
  updateRider,
  addRiderItem,
  setRiderItemStatus,
  removeRiderItem,
};
