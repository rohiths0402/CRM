import {
  Plane,
  ShieldCheck,
  Sofa,
  UtensilsCrossed,
  Volume2,
} from "lucide-react";

export const LINEUP_ROLES = [
  "Headliner",
  "Support act",
  "Opening act",
  "DJ set",
  "Dance troupe",
  "Stand-up comedian",
  "Anchor / MC",
  "Guest appearance",
];

export const ROLE_STYLE = {
  Headliner: {
    badge: "bg-primary/15 text-primary",
    block: "bg-primary text-on-primary",
  },
  "Support act": {
    badge: "bg-sky-500/15 text-sky-500",
    block: "bg-sky-500 text-white",
  },
  "Opening act": {
    badge: "bg-cyan-500/15 text-cyan-500",
    block: "bg-cyan-600 text-white",
  },
  "DJ set": {
    badge: "bg-violet-500/15 text-violet-500",
    block: "bg-violet-500 text-white",
  },
  "Dance troupe": {
    badge: "bg-emerald-500/15 text-emerald-500",
    block: "bg-emerald-600 text-white",
  },
  "Stand-up comedian": {
    badge: "bg-amber-500/15 text-amber-500",
    block: "bg-amber-600 text-white",
  },
  "Anchor / MC": {
    badge: "bg-rose-500/15 text-rose-500",
    block: "bg-rose-500 text-white",
  },
  "Guest appearance": {
    badge: "bg-fuchsia-500/15 text-fuchsia-500",
    block: "bg-fuchsia-600 text-white",
  },
};

export const LINEUP_STATUS = {
  CONFIRMED: { label: "Confirmed", tone: "bg-emerald-500/15 text-emerald-500" },
  TENTATIVE: { label: "Tentative", tone: "bg-amber-500/15 text-amber-500" },
  CANCELLED: { label: "Cancelled", tone: "bg-rose-500/15 text-rose-500" },
};

export const RIDER_STATUS = {
  PENDING: { label: "Pending", tone: "bg-amber-500/15 text-amber-500" },
  CONFIRMED: { label: "Confirmed", tone: "bg-sky-500/15 text-sky-500" },
  READY: { label: "Ready", tone: "bg-emerald-500/15 text-emerald-500" },
};

export const RIDER_CATEGORIES = {
  DIETARY: { label: "Dietary", icon: UtensilsCrossed },
  SOUND: { label: "Sound rig", icon: Volume2 },
  SECURITY: { label: "Security", icon: ShieldCheck },
  HOSPITALITY: { label: "Hospitality", icon: Sofa },
  TRAVEL: { label: "Travel", icon: Plane },
};

export const RIDER_TEMPLATES = [
  { label: "Dietary requirements arranged", category: "DIETARY" },
  { label: "Sound rig and backline confirmed", category: "SOUND" },
  { label: "Security escort assigned", category: "SECURITY" },
  { label: "Green room stocked and ready", category: "HOSPITALITY" },
  { label: "Travel and local transport arranged", category: "TRAVEL" },
  { label: "Accommodation booked", category: "TRAVEL" },
];

export const STAGE_SUGGESTIONS = [
  "Main Arena",
  "Main Stage",
  "Stage B",
  "Red Carpet",
  "Orchestra Pit",
  "Acoustic Lounge",
];
