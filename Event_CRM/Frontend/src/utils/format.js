export const formatNumber = (value) => value.toLocaleString("en-IN");

export const formatCurrency = (value) => {
  if (value >= 10000000) return `₹ ${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹ ${(value / 100000).toFixed(1)} L`;
  return `₹ ${formatNumber(value)}`;
};

export const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const formatPercent = (part, whole) =>
  whole ? Math.round((part / whole) * 100) : 0;

export const daysUntil = (isoDate) =>
  Math.ceil((new Date(isoDate) - new Date()) / 86400000);

export const to12Hour = (value) => {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
};

export const to24Hour = (value) => {
  const match = (value || "").match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return "";
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour += 12;
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
};

export const capacityTone = (percent) => {
  if (percent >= 100) return "bg-rose-500";
  if (percent >= 75) return "bg-amber-500";
  return "bg-emerald-500";
};
