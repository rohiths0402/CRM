export const LIVE_EVENT_STATUSES = ["TICKETS_LIVE", "ONGOING"];

export const TIER_STATUS = {
  ACTIVE: { label: "On sale", tone: "bg-emerald-500/15 text-emerald-500" },
  PAUSED: { label: "Paused", tone: "bg-amber-500/15 text-amber-500" },
  SOLD_OUT: { label: "Sold out", tone: "bg-rose-500/15 text-rose-500" },
};

export const PROMO_STATE = {
  ACTIVE: { label: "Active", tone: "bg-emerald-500/15 text-emerald-500" },
  DISABLED: { label: "Disabled", tone: "bg-muted/15 text-muted" },
  EXPIRED: { label: "Expired", tone: "bg-rose-500/15 text-rose-500" },
  USED_UP: { label: "Fully used", tone: "bg-amber-500/15 text-amber-500" },
};

export const DISCOUNT_TYPES = [
  { value: "PERCENT", label: "Percentage off" },
  { value: "FLAT", label: "Flat amount off" },
];

export const GST_RATES = [0, 5, 12, 18, 28];

export const TIER_NAME_SUGGESTIONS = [
  "Early Bird",
  "Phase 1 General",
  "Phase 2 General",
  "VIP Backstage Pass",
  "VVIP Table of 6",
  "Student Pass",
];
