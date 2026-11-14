import { mockEvents } from "./mockData";
import { mockTiers } from "./mockTicketing";
import { DEFAULT_ENTRY, TIER_ENTRY } from "../constants/gate";

const FIRST_NAMES = [
  "Chandran",
  "Sudarson",
  "Karthik",
  "Divya",
  "Vignesh",
  "Meena",
  "Suresh",
  "Anitha",
  "Rahul",
  "Kavya",
  "Naveen",
  "Lakshmi",
  "Prakash",
  "Deepa",
  "Maran",
  "Revathi",
  "Harish",
  "Swetha",
  "Gokul",
  "Nandini",
  "Aravind",
  "Swathi",
  "Dinesh",
  "Pooja",
  "Bala",
  "Janani",
  "Ashwin",
  "Keerthi",
  "Sathish",
  "Ishwarya",
];

const LAST_NAMES = [
  "Kumar",
  "Raj",
  "Subramanian",
  "Iyappan",
  "Nair",
  "Kavin",
  "Balu",
  "Menon",
  "Guru",
  "Sam",
  "Krishnan",
  "Natarajan",
  "Babu",
  "Rajendran",
  "Shekar",
  "Murugan",
  "Selvam",
  "Ramesh",
  "Anand",
  "Chandru",
  "Devi",
  "Prasad",
  "Mohan",
  "Venkat",
  "Naveen",
  "Pandian",
  "Jayakumar",
  "Bose",
  "Das",
  "Sundaram",
];

const ROW_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SEATS_PER_ROW = 20;
const SEATS_PER_TABLE = 6;
const ARRIVED_SHARE = 0.628;

const seededEvents = new Set(
  mockEvents
    .filter((event) => event.status === "ONGOING")
    .map((event) => event.id),
);

const mix = (value) => Math.imul(value + 1, 2654435761) >>> 0;

const rowName = (index) =>
  index < 26
    ? ROW_LETTERS[index]
    : `${ROW_LETTERS[Math.floor(index / 26) - 1]}${ROW_LETTERS[index % 26]}`;

const seatLabel = (seating, index) => {
  if (seating === "ROW") {
    return `Row ${rowName(Math.floor(index / SEATS_PER_ROW))}, Seat ${(index % SEATS_PER_ROW) + 1}`;
  }
  if (seating === "TABLE") {
    return `Table ${Math.floor(index / SEATS_PER_TABLE) + 1}, Seat ${(index % SEATS_PER_TABLE) + 1}`;
  }
  return "Standing, no seat";
};

const buildTickets = (event) => {
  const tiers = mockTiers.filter((tier) => tier.eventId === event.id);
  const seeded = seededEvents.has(event.id);
  const tickets = [];
  let sequence = 0;

  tiers.forEach((tier) => {
    const entry = TIER_ENTRY[tier.name] || DEFAULT_ENTRY;

    for (let index = 0; index < tier.sold; index += 1) {
      sequence += 1;
      const cancelled = sequence % 97 === 0;
      const arrived =
        seeded &&
        !cancelled &&
        mix(sequence * 31) % 1000 < ARRIVED_SHARE * 1000;
      const first = FIRST_NAMES[mix(sequence) % FIRST_NAMES.length];
      const last = LAST_NAMES[mix(sequence * 7 + 3) % LAST_NAMES.length];

      tickets.push({
        id: event.id * 1000000 + sequence,
        code: `TCK-${event.id}${String(sequence).padStart(5, "0")}`,
        eventId: event.id,
        tierId: tier.id,
        tierName: tier.name,
        holderName: `${first} ${last}`,
        phone: `9${String(mix(sequence * 13 + 5) % 1000000000).padStart(9, "0")}`,
        zone: entry.zone,
        gate: entry.gate,
        seat: seatLabel(entry.seating, index),
        status: cancelled ? "CANCELLED" : arrived ? "CHECKED_IN" : "VALID",
        checkedInAt: arrived
          ? new Date(
              Date.now() - (mix(sequence * 53) % 240) * 60000,
            ).toISOString()
          : null,
        checkedInGate: arrived ? entry.gate : null,
      });
    }
  });

  return tickets;
};

const cache = new Map();

export const ticketsFor = (event) => {
  if (!cache.has(event.id)) cache.set(event.id, buildTickets(event));
  return cache.get(event.id);
};

export const blockedAttempts = new Map();
