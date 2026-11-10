import { formatNumber } from "../../utils/format";

export const todayIso = () => new Date().toLocaleDateString("en-CA");

export const rupees = (value) => `₹ ${formatNumber(Math.round(value))}`;

export const totalPrice = (tier) => tier.price * (1 + tier.taxPercentage / 100);

export const promoState = (promo) => {
  if (!promo.enabled) return "DISABLED";
  if (promo.expiresOn < todayIso()) return "EXPIRED";
  if (promo.used >= promo.maxUses) return "USED_UP";
  return "ACTIVE";
};

export const discountLabel = (promo) =>
  promo.discountType === "PERCENT"
    ? `${promo.value}% off`
    : `${rupees(promo.value)} off`;

export const releasedSeats = (tiers, eventId, ignoreId) =>
  tiers
    .filter((tier) => tier.eventId === eventId && tier.id !== ignoreId)
    .reduce((sum, tier) => sum + tier.quota, 0);

const isWhole = (value) => value !== "" && Number.isInteger(Number(value));

export const emptyTierForm = {
  eventId: "",
  name: "",
  perks: "",
  price: "",
  taxPercentage: "18",
  quota: "",
  maxPerOrder: "10",
};

export const toTierFormValues = (tier) => ({
  eventId: String(tier.eventId),
  name: tier.name,
  perks: tier.perks || "",
  price: String(tier.price),
  taxPercentage: String(tier.taxPercentage),
  quota: String(tier.quota),
  maxPerOrder: String(tier.maxPerOrder),
});

export const toTierPayload = (form) => ({
  eventId: Number(form.eventId),
  name: form.name.trim(),
  perks: form.perks.trim(),
  price: Number(form.price),
  taxPercentage: Number(form.taxPercentage),
  quota: Number(form.quota),
  maxPerOrder: Number(form.maxPerOrder),
});

export const validateTier = (form, { tiers, events, editing }) => {
  const errors = {};
  const event = events.find((item) => String(item.id) === form.eventId);

  if (!event) errors.eventId = "Select the event";
  else if (event.status === "WRAP")
    errors.eventId = "This event is wrapped, so no tiers can be added";

  const name = form.name.trim();
  if (name.length < 3)
    errors.name = "Enter the tier name, at least 3 characters";
  else if (
    event &&
    tiers.some(
      (tier) =>
        tier.eventId === event.id &&
        tier.id !== editing?.id &&
        tier.name.toLowerCase() === name.toLowerCase(),
    )
  ) {
    errors.name = "This event already has a tier with this name";
  }

  if (form.perks.length > 200)
    errors.perks = "Keep the perks under 200 characters";

  const price = Number(form.price);
  if (form.price === "" || Number.isNaN(price) || price <= 0) {
    errors.price = "Enter the base price per ticket";
  } else if (editing && editing.sold > 0 && price !== editing.price) {
    errors.price = `The price is locked because ${formatNumber(editing.sold)} tickets are sold. Pause this tier and create the next phase.`;
  }

  const quota = Number(form.quota);
  if (!isWhole(form.quota) || quota <= 0) {
    errors.quota = "Enter the number of tickets as a whole number";
  } else if (event) {
    const room = event.capacity - releasedSeats(tiers, event.id, editing?.id);
    if (quota > room)
      errors.quota = `Only ${formatNumber(room)} seats are left to release for this event`;
    else if (editing && quota < editing.sold) {
      errors.quota = `${formatNumber(editing.sold)} tickets are already sold`;
    }
  }

  const perOrder = Number(form.maxPerOrder);
  if (!isWhole(form.maxPerOrder) || perOrder < 1 || perOrder > 20) {
    errors.maxPerOrder = "Enter a number from 1 to 20";
  } else if (isWhole(form.quota) && perOrder > quota) {
    errors.maxPerOrder = "This cannot be more than the quota";
  }

  return errors;
};

export const emptyPromoForm = {
  code: "",
  discountType: "PERCENT",
  value: "",
  eventId: "all",
  maxUses: "",
  expiresOn: "",
};

export const toPromoFormValues = (promo) => ({
  code: promo.code,
  discountType: promo.discountType,
  value: String(promo.value),
  eventId: promo.eventId === null ? "all" : String(promo.eventId),
  maxUses: String(promo.maxUses),
  expiresOn: promo.expiresOn,
});

export const toPromoPayload = (form) => ({
  code: form.code.trim().toUpperCase(),
  discountType: form.discountType,
  value: Number(form.value),
  eventId: form.eventId === "all" ? null : Number(form.eventId),
  maxUses: Number(form.maxUses),
  expiresOn: form.expiresOn,
});

export const validatePromo = (form, { promos, tiers, editing }) => {
  const errors = {};
  const code = form.code.trim().toUpperCase();

  if (!/^[A-Z0-9]{4,15}$/.test(code)) {
    errors.code = "Use 4 to 15 letters or numbers, no spaces";
  } else if (
    promos.some((promo) => promo.code === code && promo.id !== editing?.id)
  ) {
    errors.code = "This promo code already exists";
  } else if (editing && editing.used > 0 && code !== editing.code) {
    errors.code =
      "The code cannot change because customers have already used it";
  }

  const value = Number(form.value);
  if (form.discountType === "PERCENT") {
    if (!isWhole(form.value) || value < 1 || value > 90)
      errors.value = "Enter a whole percentage from 1 to 90";
  } else if (form.value === "" || Number.isNaN(value) || value <= 0) {
    errors.value = "Enter the discount amount in rupees";
  } else {
    const prices = tiers
      .filter(
        (tier) =>
          form.eventId === "all" || String(tier.eventId) === form.eventId,
      )
      .map((tier) => tier.price);
    if (prices.length && value >= Math.min(...prices)) {
      errors.value = `Must be lower than the cheapest ticket, ${rupees(Math.min(...prices))}`;
    }
  }

  const maxUses = Number(form.maxUses);
  if (!isWhole(form.maxUses) || maxUses < 1) {
    errors.maxUses = "Enter how many times the code can be used";
  } else if (editing && maxUses < editing.used) {
    errors.maxUses = `${formatNumber(editing.used)} uses are already counted`;
  }

  if (!form.expiresOn) errors.expiresOn = "Pick the expiry date";
  else if (
    (!editing || form.expiresOn !== editing.expiresOn) &&
    form.expiresOn < todayIso()
  ) {
    errors.expiresOn = "The expiry date cannot be in the past";
  }

  return errors;
};
