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
