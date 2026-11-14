const ticketShape = {
  id: "number",
  code: "string, the number printed under the QR code, for example TCK-700012",
  eventId: "number",
  tierId: "number",
  tierName: "string, for example VIP Backstage Pass",
  holderName: "string",
  phone: "string, 10 digit mobile number",
  zone: "string, the area the guest goes to, for example Gold Fan Pit",
  gate: "string, the gate the guest should use, for example Gate 3",
  seat: "string, for example Row C, Seat 7. Standing tickets return Standing, no seat",
  status: "VALID | CHECKED_IN | CANCELLED",
  checkedInAt: "string, ISO date time, or null",
  checkedInGate: "string, or null",
};

export const gateContract = {
  summary: {
    method: "GET",
    url: "/gate/events/{eventId}/summary",
    headers: { Authorization: "Bearer <token>" },
    note: "Cancelled tickets are not counted in expected",
    response: {
      eventId: "number",
      gateOpen: "boolean, true only while the event status is ONGOING",
      expected: "number, valid tickets, cancelled ones excluded",
      checkedIn: "number, guests inside now",
      yetToArrive: "number, expected minus checkedIn",
      cancelled: "number, cancelled or refunded tickets",
      blockedAttempts:
        "number, scans refused because of a duplicate or cancelled ticket",
      lastQuarterHour: "number, check-ins in the last 15 minutes",
      tiers: [
        {
          tierId: "number",
          name: "string",
          gate: "string",
          zone: "string",
          expected: "number",
          checkedIn: "number",
        },
      ],
      recent: [ticketShape],
    },
  },

  searchTickets: {
    method: "GET",
    url: "/gate/tickets",
    query: {
      eventId: "number",
      q: "string, at least 3 characters. Matches ticket code, holder name or mobile number. An exact code match comes first. Returns at most 8.",
    },
    response: { tickets: [ticketShape] },
  },

  checkIn: {
    method: "POST",
    url: "/gate/tickets/{ticketId}/check-in",
    request: {
      gate: "string, the gate the staff member is standing at, or null for any gate",
      overrideGate:
        "boolean, true when staff chose to let the guest in at a different gate",
    },
    response: ticketShape,
    errors: {
      403: { code: "GATE_CLOSED", message: "The event is not ONGOING" },
      409: {
        code: "ALREADY_CHECKED_IN",
        message: "Already checked in at 06:42 PM through Gate 3",
        data: { ticket: "ticket with checkedInAt and checkedInGate" },
      },
      410: {
        code: "TICKET_CANCELLED",
        message: "Ticket was cancelled and refunded",
      },
      422: {
        code: "WRONG_GATE",
        message: "This ticket is for Gate 2",
        data: { ticket: "ticket with the correct gate" },
      },
    },
    note: "Refused scans with codes ALREADY_CHECKED_IN and TICKET_CANCELLED increase blockedAttempts in the summary",
  },

  undoCheckIn: {
    method: "DELETE",
    url: "/gate/tickets/{ticketId}/check-in",
    role: "ADMIN only",
    response: ticketShape,
    note: "Used to correct a wrong tap. Status goes back to VALID.",
    errors: {
      403: { code: "GATE_CLOSED", message: "The event is not ONGOING" },
      409: "The ticket is not checked in",
    },
  },
};
