import { mockEvents } from "./mockData";
import { DELIVERABLE_TEMPLATES } from "../constants/sponsors";

const shiftDate = (isoDate, days) => {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-CA");
};

export const buildDeliverables = (sponsorId, tier, eventDate, progress = 0) => {
  const items = DELIVERABLE_TEMPLATES[tier];
  const done = Math.floor(items.length * progress);

  return items.map((text, index) => {
    let status = "PENDING";
    if (index < done) status = "DONE";
    else if (index === done && progress > 0) status = "IN_REVIEW";

    return {
      id: sponsorId * 100 + index + 1,
      text,
      dueDate: shiftDate(eventDate, -(items.length - index) * 2),
      status,
    };
  });
};

const eventDateOf = (eventId) =>
  mockEvents.find((event) => event.id === eventId).date;

const makeSponsor = (seed) => {
  const [
    id,
    eventId,
    brandName,
    industry,
    tier,
    contractValue,
    amountReceived,
    progress,
    hasContract,
  ] = seed.core;
  const [contactName, contactEmail, contactPhone] = seed.contact;
  const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    id,
    eventId,
    brandName,
    industry,
    tier,
    contractValue,
    amountReceived,
    contactName,
    contactEmail,
    contactPhone,
    contractFile: hasContract
      ? { name: `${slug}-contract.pdf`, size: 420000 + id * 17000, url: null }
      : null,
    deliverables:
      seed.deliverables ||
      buildDeliverables(id, tier, eventDateOf(eventId), progress),
  };
};

const pepsiDeliverables = [
  {
    id: 101,
    text: "Logo on the main LED backdrop",
    dueDate: "2026-11-14",
    status: "DONE",
  },
  {
    id: 102,
    text: "2 brand activation stalls at Gate A",
    dueDate: "2026-11-16",
    status: "DONE",
  },
  {
    id: 103,
    text: "50 VIP hospitality passes delivered",
    dueDate: "2026-11-18",
    status: "IN_REVIEW",
  },
  {
    id: 104,
    text: "30-second video commercial on the big screen every 45 minutes",
    dueDate: "2026-11-20",
    status: "PENDING",
  },
];

export const mockSponsors = [
  makeSponsor({
    core: [1, 1, "Pepsi", "Beverages", "TITLE", 12500000, 9375000, 0, true],
    contact: [
      "Rohan Mehta",
      "partnerships@pepsi-partner.example",
      "9811100001",
    ],
    deliverables: pepsiDeliverables,
  }),
  makeSponsor({
    core: [
      2,
      1,
      "TVS Apache",
      "Automobile",
      "POWERED_BY",
      6000000,
      6000000,
      0.75,
      true,
    ],
    contact: ["Divya Narayanan", "brand@tvs-partner.example", "9811100002"],
  }),
  makeSponsor({
    core: [
      3,
      1,
      "Red Bull",
      "Beverages",
      "ASSOCIATE",
      2000000,
      1000000,
      0.5,
      true,
    ],
    contact: ["Aman Kapoor", "events@redbull-partner.example", "9811100003"],
  }),
  makeSponsor({
    core: [
      4,
      1,
      "Radio Mirchi",
      "Media and radio",
      "ASSOCIATE",
      1500000,
      0,
      0.35,
      false,
    ],
    contact: ["Shruti Iyer", "sales@mirchi-partner.example", "9811100004"],
  }),
  makeSponsor({
    core: [5, 1, "Boat", "Technology", "ASSOCIATE", 1200000, 1200000, 1, true],
    contact: ["Karan Shah", "collab@boat-partner.example", "9811100005"],
  }),
  makeSponsor({
    core: [
      6,
      2,
      "Malabar Gold & Diamonds",
      "Jewellery",
      "TITLE",
      8000000,
      4000000,
      0.4,
      true,
    ],
    contact: [
      "Faisal Rahman",
      "marketing@malabar-partner.example",
      "9811100006",
    ],
  }),
  makeSponsor({
    core: [
      7,
      2,
      "Sun Music",
      "Media and radio",
      "ASSOCIATE",
      1800000,
      1800000,
      0.67,
      true,
    ],
    contact: ["Lakshmi Priya", "ads@sunmusic-partner.example", "9811100007"],
  }),
  makeSponsor({
    core: [
      8,
      2,
      "Fastrack",
      "Retail and fashion",
      "ASSOCIATE",
      1000000,
      0,
      0,
      false,
    ],
    contact: ["Nisha Verma", "brand@fastrack-partner.example", "9811100008"],
  }),
  makeSponsor({
    core: [
      9,
      3,
      "Zomato",
      "Food and delivery",
      "ASSOCIATE",
      900000,
      900000,
      1,
      true,
    ],
    contact: ["Ishaan Gupta", "partners@zomato-partner.example", "9811100009"],
  }),
  makeSponsor({
    core: [
      10,
      4,
      "Pothys",
      "Retail and fashion",
      "TITLE",
      3000000,
      1500000,
      0.4,
      true,
    ],
    contact: ["Murugan S", "marketing@pothys-partner.example", "9811100010"],
  }),
  makeSponsor({
    core: [
      11,
      5,
      "Aavin",
      "Food and delivery",
      "ASSOCIATE",
      500000,
      0,
      0,
      false,
    ],
    contact: ["Selvi K", "promo@aavin-partner.example", "9811100011"],
  }),
  makeSponsor({
    core: [
      12,
      6,
      "Royal Enfield",
      "Automobile",
      "TITLE",
      9000000,
      9000000,
      0.8,
      true,
    ],
    contact: ["Vikram Rao", "events@re-partner.example", "9811100012"],
  }),
  makeSponsor({
    core: [
      13,
      6,
      "Spotify India",
      "Media and radio",
      "ASSOCIATE",
      2200000,
      1100000,
      0.67,
      true,
    ],
    contact: ["Ananya Bose", "india@spotify-partner.example", "9811100013"],
  }),
  makeSponsor({
    core: [
      14,
      6,
      "Nandini Dairy",
      "Food and delivery",
      "ASSOCIATE",
      1200000,
      0,
      0,
      false,
    ],
    contact: ["Ramesh Gowda", "brand@nandini-partner.example", "9811100014"],
  }),
  makeSponsor({
    core: [15, 7, "Tata Play", "Telecom", "TITLE", 6500000, 6500000, 1, true],
    contact: [
      "Neha Joshi",
      "partnerships@tataplay-partner.example",
      "9811100015",
    ],
  }),
  makeSponsor({
    core: [
      16,
      7,
      "Radio City",
      "Media and radio",
      "ASSOCIATE",
      1400000,
      1400000,
      0.67,
      true,
    ],
    contact: ["Sameer Patil", "sales@radiocity-partner.example", "9811100016"],
  }),
  makeSponsor({
    core: [17, 7, "Jio", "Telecom", "POWERED_BY", 4000000, 2000000, 0.5, true],
    contact: ["Pooja Agarwal", "events@jio-partner.example", "9811100017"],
  }),
  makeSponsor({
    core: [
      18,
      8,
      "Dream11",
      "Sports and fitness",
      "TITLE",
      20000000,
      15000000,
      0.6,
      true,
    ],
    contact: ["Harsh Vardhan", "brand@dream11-partner.example", "9811100018"],
  }),
  makeSponsor({
    core: [
      19,
      8,
      "Puma",
      "Sports and fitness",
      "POWERED_BY",
      9000000,
      4500000,
      0.5,
      true,
    ],
    contact: ["Tanvi Sethi", "sports@puma-partner.example", "9811100019"],
  }),
  makeSponsor({
    core: [
      20,
      8,
      "Amul",
      "Food and delivery",
      "ASSOCIATE",
      2500000,
      0,
      0,
      false,
    ],
    contact: ["Jignesh Patel", "marketing@amul-partner.example", "9811100020"],
  }),
  makeSponsor({
    core: [
      21,
      10,
      "Hyundai",
      "Automobile",
      "TITLE",
      9500000,
      4750000,
      0.5,
      true,
    ],
    contact: ["Sai Kiran", "brand@hyundai-partner.example", "9811100021"],
  }),
  makeSponsor({
    core: [22, 10, "Aha", "Media and radio", "ASSOCIATE", 2000000, 0, 0, false],
    contact: ["Mounika R", "ads@aha-partner.example", "9811100022"],
  }),
  makeSponsor({
    core: [
      23,
      11,
      "Thums Up",
      "Beverages",
      "TITLE",
      8000000,
      3200000,
      0.4,
      true,
    ],
    contact: ["Debashish Roy", "events@thumsup-partner.example", "9811100023"],
  }),
];

export const syncSponsorCounts = () => {
  mockEvents.forEach((event, index) => {
    const count = mockSponsors.filter(
      (sponsor) => sponsor.eventId === event.id,
    ).length;
    if (event.sponsors !== count)
      mockEvents[index] = { ...event, sponsors: count };
  });
};

syncSponsorCounts();
