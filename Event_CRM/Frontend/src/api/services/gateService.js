import { http } from "../httpClient";
import { ENDPOINTS, USE_MOCK } from "../endpoints";
import { mockDelay, mockEvents } from "../../mocks/mockData";
import { blockedAttempts, ticketsFor } from "../../mocks/mockGate";
import { GATE_ERROR } from "../../constants/gate";

const QUARTER_HOUR = 15 * 60 * 1000;
const MAX_RESULTS = 8;

const findEvent = (eventId) => {
  const event = mockEvents.find((item) => item.id === Number(eventId));
  if (!event) throw new Error("Event not found");
  return event;
};

const findTicket = (ticketId) => {
  for (const event of mockEvents) {
    const ticket = ticketsFor(event).find((item) => item.id === ticketId);
    if (ticket) return { ticket, event };
  }
  throw new Error("Ticket not found");
};

const timeOf = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const countBlocked = (eventId) =>
  blockedAttempts.set(eventId, (blockedAttempts.get(eventId) || 0) + 1);

const fail = (code, message, ticket) => {
  const error = new Error(message);
  error.code = code;
  if (ticket) error.data = { ticket: { ...ticket } };
  throw error;
};

const getSummary = async (eventId) => {
  if (!USE_MOCK) return http.get(ENDPOINTS.gate.summary(eventId));
  await mockDelay(300);
  const event = findEvent(eventId);
  const tickets = ticketsFor(event);
  const valid = tickets.filter((ticket) => ticket.status !== "CANCELLED");
  const inside = valid.filter((ticket) => ticket.status === "CHECKED_IN");
  const since = Date.now() - QUARTER_HOUR;

  const tiers = [];
  tickets.forEach((ticket) => {
    let row = tiers.find((item) => item.tierId === ticket.tierId);
    if (!row) {
      row = {
        tierId: ticket.tierId,
        name: ticket.tierName,
        gate: ticket.gate,
        zone: ticket.zone,
        expected: 0,
        checkedIn: 0,
      };
      tiers.push(row);
    }
    if (ticket.status !== "CANCELLED") {
      row.expected += 1;
      if (ticket.status === "CHECKED_IN") row.checkedIn += 1;
    }
  });

  return {
    eventId: event.id,
    gateOpen: event.status === "ONGOING",
    expected: valid.length,
    checkedIn: inside.length,
    yetToArrive: valid.length - inside.length,
    cancelled: tickets.length - valid.length,
    blockedAttempts: blockedAttempts.get(event.id) || 0,
    lastQuarterHour: inside.filter(
      (ticket) => new Date(ticket.checkedInAt).getTime() >= since,
    ).length,
    tiers,
    recent: [...inside]
      .sort((a, b) => b.checkedInAt.localeCompare(a.checkedInAt))
      .slice(0, MAX_RESULTS)
      .map((ticket) => ({ ...ticket })),
  };
};

const searchTickets = async (eventId, query) => {
  if (!USE_MOCK) {
    return http.get(
      `${ENDPOINTS.gate.tickets}?eventId=${eventId}&q=${encodeURIComponent(query)}`,
    );
  }
  await mockDelay(150);
  const term = query.trim().toLowerCase();
  if (term.length < 3) return { tickets: [] };

  const tickets = ticketsFor(findEvent(eventId));
  const digits = term.replace(/\D/g, "");
  const found = [];

  const exact = tickets.find((ticket) => ticket.code.toLowerCase() === term);
  if (exact) found.push(exact);

  for (const ticket of tickets) {
    if (found.length >= MAX_RESULTS) break;
    if (ticket === exact) continue;
    const matches =
      ticket.code.toLowerCase().includes(term) ||
      ticket.holderName.toLowerCase().includes(term) ||
      (digits.length >= 3 && ticket.phone.includes(digits));
    if (matches) found.push(ticket);
  }

  return { tickets: found.map((ticket) => ({ ...ticket })) };
};

const checkIn = async (ticketId, { gate, overrideGate = false }) => {
  if (!USE_MOCK)
    return http.post(ENDPOINTS.gate.checkIn(ticketId), { gate, overrideGate });
  await mockDelay(250);
  const { ticket, event } = findTicket(ticketId);

  if (event.status !== "ONGOING") {
    fail(
      GATE_ERROR.GATE_CLOSED,
      "Gates are closed. Check-in works only while the event is Ongoing.",
      ticket,
    );
  }
  if (ticket.status === "CANCELLED") {
    countBlocked(event.id);
    fail(
      GATE_ERROR.TICKET_CANCELLED,
      "This ticket was cancelled and refunded. Do not allow entry.",
      ticket,
    );
  }
  if (ticket.status === "CHECKED_IN") {
    countBlocked(event.id);
    fail(
      GATE_ERROR.ALREADY_CHECKED_IN,
      `Already checked in at ${timeOf(ticket.checkedInAt)} through ${ticket.checkedInGate}. This could be a duplicate or shared QR code.`,
      ticket,
    );
  }
  if (gate && gate !== ticket.gate && !overrideGate) {
    fail(
      GATE_ERROR.WRONG_GATE,
      `This ticket is for ${ticket.gate}. Send the guest to ${ticket.gate}.`,
      ticket,
    );
  }

  ticket.status = "CHECKED_IN";
  ticket.checkedInAt = new Date().toISOString();
  ticket.checkedInGate = gate || ticket.gate;
  return { ...ticket };
};

const undoCheckIn = async (ticketId) => {
  if (!USE_MOCK) return http.delete(ENDPOINTS.gate.checkIn(ticketId));
  await mockDelay(250);
  const { ticket, event } = findTicket(ticketId);

  if (event.status !== "ONGOING") {
    fail(
      GATE_ERROR.GATE_CLOSED,
      "Gates are closed. Check-in works only while the event is Ongoing.",
      ticket,
    );
  }
  if (ticket.status !== "CHECKED_IN")
    throw new Error("This ticket is not checked in");

  ticket.status = "VALID";
  ticket.checkedInAt = null;
  ticket.checkedInGate = null;
  return { ...ticket };
};

export const gateService = { getSummary, searchTickets, checkIn, undoCheckIn };
