export const GATES = ["Gate 1", "Gate 2", "Gate 3", "Gate 4"];

export const TIER_ENTRY = {
  "VVIP Table of 6": {
    gate: "Gate 1",
    zone: "VVIP Lounge A",
    seating: "TABLE",
  },
  "VIP Backstage Pass": {
    gate: "Gate 2",
    zone: "Platinum Seated",
    seating: "ROW",
  },
  "Phase 1 General": {
    gate: "Gate 3",
    zone: "Gold Fan Pit",
    seating: "STANDING",
  },
  "Early Bird": {
    gate: "Gate 4",
    zone: "Silver Standing",
    seating: "STANDING",
  },
};

export const DEFAULT_ENTRY = {
  gate: "Gate 3",
  zone: "General entry",
  seating: "STANDING",
};

export const TICKET_STATUS = {
  VALID: { label: "Not arrived", tone: "bg-sky-500/15 text-sky-500" },
  CHECKED_IN: { label: "Inside", tone: "bg-emerald-500/15 text-emerald-500" },
  CANCELLED: { label: "Cancelled", tone: "bg-rose-500/15 text-rose-500" },
};

export const GATE_ERROR = {
  GATE_CLOSED: "GATE_CLOSED",
  TICKET_CANCELLED: "TICKET_CANCELLED",
  ALREADY_CHECKED_IN: "ALREADY_CHECKED_IN",
  WRONG_GATE: "WRONG_GATE",
};
