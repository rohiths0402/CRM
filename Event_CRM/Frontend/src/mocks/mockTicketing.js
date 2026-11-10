import { mockEvents } from "./mockData";

const GST_RATE = 18;
const LIVE_STATUSES = ["TICKETS_LIVE", "ONGOING"];

const TIER_BLUEPRINT = [
  {
    name: "Early Bird",
    perks: "Discounted general entry for the first buyers",
    multiplier: 0.6,
    share: 0.35,
    bias: 1.4,
    maxPerOrder: 10,
  },
  {
    name: "Phase 1 General",
    perks: "General entry to all open zones",
    multiplier: 1,
    share: 0.4,
    bias: 1.2,
    maxPerOrder: 10,
  },
  {
    name: "VIP Backstage Pass",
    perks: "Premium seating, lounge access and a backstage walkthrough",
    multiplier: 2.4,
    share: 0.18,
    bias: 0.9,
    maxPerOrder: 6,
  },
  {
    name: "VVIP Table of 6",
    perks:
      "Private table with hospitality and priority entry, priced per guest",
    multiplier: 5,
    share: 0.07,
    bias: 0.7,
    maxPerOrder: 6,
  },
];

const dayOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-CA");
};

const spreadSales = (total, quotas, biases) => {
  const sold = quotas.map(() => 0);
  let left = total;
  let open = quotas.map((_, index) => index);

  while (left > 0 && open.length) {
    const weight = open.reduce(
      (sum, index) => sum + quotas[index] * biases[index],
      0,
    );
    let given = 0;

    open.forEach((index) => {
      const room = quotas[index] - sold[index];
      const share = Math.min(
        room,
        Math.floor((left * quotas[index] * biases[index]) / weight),
      );
      sold[index] += share;
      given += share;
    });

    left -= given;
    open = open.filter((index) => sold[index] < quotas[index]);

    if (given === 0 && open.length) {
      sold[open[0]] += 1;
      left -= 1;
    }
  }

  return sold;
};

const buildTiersFor = (event) => {
  const releasable = Math.round(
    event.capacity * (event.status === "SOLD_OUT" ? 1 : 0.9),
  );
  const quotas = TIER_BLUEPRINT.map((tier) =>
    Math.round(releasable * tier.share),
  );
  quotas[1] += releasable - quotas.reduce((sum, value) => sum + value, 0);

  const sold = spreadSales(
    event.ticketsSold,
    quotas,
    TIER_BLUEPRINT.map((tier) => tier.bias),
  );

  const weighted = sold.reduce(
    (sum, value, index) => sum + value * TIER_BLUEPRINT[index].multiplier,
    0,
  );
  const unit = weighted ? event.grossRevenue / weighted : 1000;

  return TIER_BLUEPRINT.map((blueprint, index) => {
    let status = LIVE_STATUSES.includes(event.status) ? "ACTIVE" : "PAUSED";
    if (sold[index] >= quotas[index]) status = "SOLD_OUT";

    return {
      id: event.id * 10 + index + 1,
      eventId: event.id,
      name: blueprint.name,
      perks: blueprint.perks,
      price: Math.max(100, Math.round((unit * blueprint.multiplier) / 50) * 50),
      taxPercentage: GST_RATE,
      quota: quotas[index],
      sold: sold[index],
      maxPerOrder: blueprint.maxPerOrder,
      status,
    };
  });
};

export const mockTiers = mockEvents
  .filter((event) => event.status !== "DRAFT")
  .flatMap(buildTiersFor);

mockEvents.forEach((event) => {
  const tiers = mockTiers.filter((tier) => tier.eventId === event.id);
  if (tiers.length) {
    event.grossRevenue = tiers.reduce(
      (sum, tier) => sum + tier.sold * tier.price,
      0,
    );
  }
});

export const mockPromos = [
  {
    id: 1,
    code: "LOOPVIP20",
    discountType: "PERCENT",
    value: 20,
    eventId: 1,
    maxUses: 500,
    used: 312,
    expiresOn: dayOffset(12),
    enabled: true,
  },
  {
    id: 2,
    code: "EARLYBIRD500",
    discountType: "FLAT",
    value: 500,
    eventId: null,
    maxUses: 1000,
    used: 1000,
    expiresOn: dayOffset(30),
    enabled: true,
  },
  {
    id: 3,
    code: "KOVAI10",
    discountType: "PERCENT",
    value: 10,
    eventId: 4,
    maxUses: 300,
    used: 85,
    expiresOn: dayOffset(25),
    enabled: true,
  },
  {
    id: 4,
    code: "STUDENT25",
    discountType: "PERCENT",
    value: 25,
    eventId: null,
    maxUses: 250,
    used: 40,
    expiresOn: dayOffset(-3),
    enabled: true,
  },
  {
    id: 5,
    code: "BLRINDIE15",
    discountType: "PERCENT",
    value: 15,
    eventId: 6,
    maxUses: 400,
    used: 120,
    expiresOn: dayOffset(18),
    enabled: false,
  },
];
