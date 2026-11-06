import {
  CalendarRange,
  Ticket,
  Handshake,
  Mic2,
  ScanLine,
  IndianRupee,
} from "lucide-react";

export const FEATURES = [
  {
    icon: CalendarRange,
    title: "Events Master",
    text: "A kanban pipeline from draft to wrap, with a guided form to create any event.",
  },
  {
    icon: Ticket,
    title: "Ticketing & Tiers",
    text: "Tier pricing with GST, promo codes and live inventory for every phase of sale.",
  },
  {
    icon: Handshake,
    title: "Sponsors & Deliverables",
    text: "Every brand contract and every promised deliverable, ticked off one by one.",
  },
  {
    icon: Mic2,
    title: "Artist Lineup & Riders",
    text: "An hour-by-hour stage call sheet with green rooms and rider notes beside it.",
  },
  {
    icon: ScanLine,
    title: "Gate Check-In",
    text: "Scan or search a ticket and the turnstile counters update on the spot.",
  },
  {
    icon: IndianRupee,
    title: "Financials & P&L",
    text: "Revenue against production cost with live margins and a one-click audit export.",
  },
];

export const STATS = [
  { value: 18450, label: "Tickets sold this season" },
  { value: 14, label: "Brand sponsors onboarded" },
  { value: 12, label: "Connected modules" },
  { value: 84, suffix: "%", label: "Average fill rate" },
];

export const EVENT_TYPES = [
  "Music festivals",
  "Award nights",
  "Stand-up carnivals",
  "Audio launches",
  "College fests",
  "Sports leagues",
  "Brand activations",
  "Red carpet premieres",
];

export const ROLE_CARDS = [
  {
    role: "Event Director",
    text: "Full access to all 12 modules, budgets, contracts and the P&L.",
  },
  {
    role: "Operations Manager",
    text: "Venues, stage plans, crew rosters and artist call sheets.",
  },
  {
    role: "Sponsorship Lead",
    text: "Brand deals, deliverables, ticket tiers and inbound pitches.",
  },
  {
    role: "Gate Marshal",
    text: "Ticket scanning and attendee check-in, nothing else on screen.",
  },
];
