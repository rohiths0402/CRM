export const SPONSOR_TIERS = {
  TITLE: {
    label: "Title Sponsor",
    short: "Title",
    tone: "bg-primary/15 text-primary",
    limit: 1,
    hint: "Main naming rights. One brand per event.",
  },
  POWERED_BY: {
    label: "Powered By Partner",
    short: "Powered by",
    tone: "bg-sky-500/15 text-sky-500",
    limit: 3,
    hint: "Up to 3 brands per event.",
  },
  ASSOCIATE: {
    label: "Associate / Media Partner",
    short: "Associate",
    tone: "bg-violet-500/15 text-violet-500",
    limit: null,
    hint: "Media and supporting brands, no limit.",
  },
};

export const PAYMENT_STATUS = {
  PENDING: { label: "Payment pending", tone: "bg-amber-500/15 text-amber-500" },
  PARTIAL: { label: "Part paid", tone: "bg-sky-500/15 text-sky-500" },
  PAID: { label: "Fully paid", tone: "bg-emerald-500/15 text-emerald-500" },
};

export const DELIVERABLE_STATUS = {
  PENDING: { label: "Pending", tone: "bg-amber-500/15 text-amber-500" },
  IN_REVIEW: { label: "In review", tone: "bg-sky-500/15 text-sky-500" },
  DONE: { label: "Done", tone: "bg-emerald-500/15 text-emerald-500" },
};

export const INDUSTRIES = [
  "Beverages",
  "Automobile",
  "Media and radio",
  "Technology",
  "Banking and finance",
  "Retail and fashion",
  "Food and delivery",
  "Jewellery",
  "Sports and fitness",
  "Telecom",
  "Other",
];

export const DELIVERABLE_TEMPLATES = {
  TITLE: [
    "Logo on the main LED backdrop",
    "Naming rights on tickets and posters",
    "Brand activation stall at Gate A",
    "50 VIP hospitality passes delivered",
    "30-second video commercial on the big screen every 45 minutes",
  ],
  POWERED_BY: [
    "Logo on the stage side panels",
    "Brand stall at Gate A",
    "20 hospitality passes delivered",
    "Mention in all event announcements",
  ],
  ASSOCIATE: [
    "Logo on the sponsor wall",
    "10 hospitality passes delivered",
    "Social media mention",
  ],
};

export const paymentStatusFor = (received, value) => {
  if (received <= 0) return "PENDING";
  if (received >= value) return "PAID";
  return "PARTIAL";
};
