export const VENUE_TYPES = [
  "Open ground",
  "Indoor stadium",
  "Stadium",
  "Concert hall",
  "Convention centre",
];

export const ZONE_KINDS = ["Lounge", "Seated", "Standing"];

export const SAFETY_STATUS = {
  VERIFIED: { label: "Verified", tone: "bg-emerald-500/15 text-emerald-500" },
  PENDING: {
    label: "Inspection pending",
    tone: "bg-amber-500/15 text-amber-500",
  },
  ACTION_REQUIRED: {
    label: "Action required",
    tone: "bg-rose-500/15 text-rose-500",
  },
};
