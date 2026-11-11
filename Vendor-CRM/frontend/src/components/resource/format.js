const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** ₹1,18,000; "—" when there is no amount. */
export function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "—";
  return rupees.format(Number(value));
}

/** "2026-11-02" → "02 Nov 2026". */
export function formatDate(value) {
  if (!value) return "—";
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function todayIso() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function sum(records, pick) {
  return records.reduce((total, record) => total + (Number(pick(record)) || 0), 0);
}
