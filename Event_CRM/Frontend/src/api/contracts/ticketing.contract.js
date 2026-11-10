const tierShape = {
  id: "number",
  eventId: "number",
  eventTitle: "string, read only",
  eventStatus:
    "DRAFT | ANNOUNCED | TICKETS_LIVE | SOLD_OUT | ONGOING | WRAP, read only",
  name: "string, for example Early Bird",
  perks: "string, what the buyer gets",
  price: "number, base price per ticket in rupees, before GST",
  taxPercentage: "number, GST percentage, for example 18",
  quota: "number, tickets released for sale in this tier",
  sold: "number, read only",
  maxPerOrder: "number",
  status: "ACTIVE | PAUSED | SOLD_OUT",
};

const tierInput = {
  eventId: tierShape.eventId,
  name: tierShape.name,
  perks: tierShape.perks,
  price: tierShape.price,
  taxPercentage: tierShape.taxPercentage,
  quota: tierShape.quota,
  maxPerOrder: tierShape.maxPerOrder,
};

const promoShape = {
  id: "number",
  code: "string, uppercase letters and numbers, 4 to 15 characters",
  discountType: "PERCENT | FLAT",
  value: "number, percent from 1 to 90, or rupees for FLAT",
  eventId: "number, or null when the code works for every event",
  maxUses: "number",
  used: "number, read only",
  expiresOn: "string, YYYY-MM-DD",
  enabled: "boolean",
};

const promoInput = {
  code: promoShape.code,
  discountType: promoShape.discountType,
  value: promoShape.value,
  eventId: promoShape.eventId,
  maxUses: promoShape.maxUses,
  expiresOn: promoShape.expiresOn,
};

export const ticketingContract = {
  listTiers: {
    method: "GET",
    url: "/ticketing/tiers",
    headers: { Authorization: "Bearer <token>" },
    response: { tiers: [tierShape] },
  },

  createTier: {
    method: "POST",
    url: "/ticketing/tiers",
    request: tierInput,
    response: tierShape,
    note: "A new tier starts as PAUSED with sold 0",
    errors: {
      400: "Quota is more than the seats left to release for the event",
      409: "The event already has a tier with this name",
    },
  },

  updateTier: {
    method: "PUT",
    url: "/ticketing/tiers/{id}",
    request: tierInput,
    response: tierShape,
    note: "eventId cannot change. Status becomes SOLD_OUT when sold reaches quota.",
    errors: {
      400: "Quota is lower than tickets sold, or price changed after tickets were sold",
    },
  },

  updateTierStatus: {
    method: "PATCH",
    url: "/ticketing/tiers/{id}/status",
    request: { status: "ACTIVE | PAUSED" },
    response: tierShape,
    errors: {
      409: "The tier is sold out, or the event is not TICKETS_LIVE or ONGOING",
    },
  },

  removeTier: {
    method: "DELETE",
    url: "/ticketing/tiers/{id}",
    role: "ADMIN only",
    errors: {
      409: "The tier has sold tickets",
    },
  },

  listPromos: {
    method: "GET",
    url: "/ticketing/promos",
    headers: { Authorization: "Bearer <token>" },
    response: { promos: [promoShape] },
  },

  createPromo: {
    method: "POST",
    url: "/ticketing/promos",
    request: promoInput,
    response: promoShape,
    errors: {
      400: "Expiry is in the past, or a flat discount is not lower than the cheapest ticket",
      409: "The code already exists",
    },
  },

  updatePromo: {
    method: "PUT",
    url: "/ticketing/promos/{id}",
    request: promoInput,
    response: promoShape,
    errors: {
      400: "Max uses is lower than the uses already counted",
      409: "The code cannot change after customers have used it",
    },
  },

  updatePromoStatus: {
    method: "PATCH",
    url: "/ticketing/promos/{id}/status",
    request: { enabled: "boolean" },
    response: promoShape,
  },

  removePromo: {
    method: "DELETE",
    url: "/ticketing/promos/{id}",
    role: "ADMIN only",
    errors: {
      409: "Customers have used this code, disable it instead",
    },
  },
};
