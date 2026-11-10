import { daysUntil } from "../../utils/format";

export const nocState = (isoDate) => {
  const days = daysUntil(isoDate);

  if (days < 0) {
    return {
      key: "expired",
      days,
      label: "Fire NOC expired",
      tone: "bg-rose-500/15 text-rose-500",
    };
  }
  if (days <= 60) {
    return {
      key: "expiring",
      days,
      label: `Fire NOC expires in ${days} day${days === 1 ? "" : "s"}`,
      tone: "bg-amber-500/15 text-amber-500",
    };
  }
  return {
    key: "valid",
    days,
    label: "Fire NOC valid",
    tone: "bg-emerald-500/15 text-emerald-500",
  };
};

export const zoneSummary = (venue) => {
  const allocated = venue.zones.reduce((sum, zone) => sum + zone.capacity, 0);
  const sold = venue.zones.reduce((sum, zone) => sum + zone.sold, 0);
  const verified = venue.zones.filter(
    (zone) => zone.safetyStatus === "VERIFIED",
  ).length;

  return {
    total: venue.zones.length,
    allocated,
    sold,
    verified,
    left: venue.capacity - allocated,
  };
};

export const needsAttention = (venue) =>
  nocState(venue.fireNocValidTill).key !== "valid" ||
  venue.zones.some((zone) => zone.safetyStatus !== "VERIFIED");
