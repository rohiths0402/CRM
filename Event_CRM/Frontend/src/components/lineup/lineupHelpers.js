import { findSlotProblems } from "../../utils/lineupRules";
import { formatNumber } from "../../utils/format";

const PHONE = /^[6-9]\d{9}$/;

export const rupees = (value) => `₹ ${formatNumber(Math.round(value))}`;

export const readiness = (slot) => {
  const total = slot.riderItems.length;
  const ready = slot.riderItems.filter(
    (item) => item.status === "READY",
  ).length;
  const confirmed = slot.riderItems.filter(
    (item) => item.status === "CONFIRMED",
  ).length;

  return {
    total,
    ready,
    confirmed,
    pending: total - ready - confirmed,
    percent: total ? Math.round((ready / total) * 100) : 0,
  };
};

export const slotIssues = (slot, context) =>
  slot.status === "CANCELLED"
    ? []
    : Object.values(findSlotProblems(slot, { ...context, ignoreId: slot.id }));

export const attentionCounts = (slots, context) => {
  const active = slots.filter((slot) => slot.status !== "CANCELLED");

  return {
    tentative: active.filter((slot) => slot.status === "TENTATIVE").length,
    noRoom: active.filter(
      (slot) => slot.greenRoom === null && slot.role !== "Guest appearance",
    ).length,
    riderOpen: active.filter(
      (slot) => readiness(slot).ready < slot.riderItems.length,
    ).length,
    conflicts: active.filter((slot) => slotIssues(slot, context).length > 0)
      .length,
  };
};

export const emptySlotForm = {
  artistName: "",
  role: "",
  stage: "",
  start: "",
  end: "",
  soundcheck: "",
  greenRoom: "",
  status: "TENTATIVE",
  fee: "",
  advancePaid: "",
  managerName: "",
  managerPhone: "",
  addStandardRider: true,
};

export const toSlotFormValues = (slot) => ({
  artistName: slot.artistName,
  role: slot.role,
  stage: slot.stage,
  start: slot.start,
  end: slot.end,
  soundcheck: slot.soundcheck,
  greenRoom: slot.greenRoom ? String(slot.greenRoom) : "",
  status: slot.status,
  fee: String(slot.fee),
  advancePaid: String(slot.advancePaid),
  managerName: slot.managerName,
  managerPhone: slot.managerPhone,
  addStandardRider: false,
});

export const toSlotPayload = (form, eventId, editing) => {
  const payload = {
    eventId,
    artistName: form.artistName.trim(),
    role: form.role,
    stage: form.stage.trim(),
    start: form.start,
    end: form.end,
    soundcheck: form.soundcheck,
    greenRoom: form.greenRoom === "" ? null : Number(form.greenRoom),
    status: form.status,
    fee: Number(form.fee) || 0,
    advancePaid: Number(form.advancePaid) || 0,
    managerName: form.managerName.trim(),
    managerPhone: form.managerPhone.trim(),
  };

  if (!editing) payload.addStandardRider = form.addStandardRider;
  return payload;
};

export const validateSlot = (form, { slots, event, venue, editing }) => {
  const errors = {};

  if (form.artistName.trim().length < 2)
    errors.artistName = "Enter the artist or act name";
  if (!form.role) errors.role = "Select the role";
  if (form.stage.trim().length < 2) errors.stage = "Enter the stage name";
  if (!form.start) errors.start = "Enter the start time";
  if (!form.end) errors.end = "Enter the end time";

  const fee = form.fee === "" ? 0 : Number(form.fee);
  const advance = form.advancePaid === "" ? 0 : Number(form.advancePaid);
  if (Number.isNaN(fee) || fee < 0)
    errors.fee = "Enter the artist fee, or leave it empty";
  if (Number.isNaN(advance) || advance < 0)
    errors.advancePaid = "Enter the advance paid, or leave it empty";
  else if (!errors.fee && advance > fee)
    errors.advancePaid = `Cannot be more than the fee, ${rupees(fee)}`;

  if (
    form.greenRoom !== "" &&
    (!Number.isInteger(Number(form.greenRoom)) || Number(form.greenRoom) < 1)
  ) {
    errors.greenRoom = "Enter a green room number, or leave it empty";
  }

  const hasName = form.managerName.trim().length >= 2;
  const hasPhone = PHONE.test(form.managerPhone.trim());
  if (form.status === "CONFIRMED") {
    if (!hasName)
      errors.managerName = "A confirmed artist needs a manager name";
    if (!hasPhone)
      errors.managerPhone = "A confirmed artist needs a 10 digit mobile number";
  } else if (form.managerPhone.trim() && !hasPhone) {
    errors.managerPhone = "Enter a 10 digit mobile number";
  }

  const ready =
    form.artistName.trim() && form.stage.trim() && form.start && form.end;
  if (!ready) return errors;

  const rules = findSlotProblems(toSlotPayload(form, event.id, editing), {
    event,
    venue,
    slots,
    ignoreId: editing?.id,
  });

  return { ...rules, ...errors };
};

export const emptyRiderForm = {
  managerName: "",
  managerPhone: "",
  managerEmail: "",
  dietaryNotes: "",
  soundRigNotes: "",
  securityNotes: "",
  escortRequired: false,
};

export const toRiderFormValues = (slot) => ({
  managerName: slot.managerName,
  managerPhone: slot.managerPhone,
  managerEmail: slot.managerEmail || "",
  dietaryNotes: slot.dietaryNotes || "",
  soundRigNotes: slot.soundRigNotes || "",
  securityNotes: slot.securityNotes || "",
  escortRequired: slot.escortRequired,
});

export const validateRider = (form, slot) => {
  const errors = {};
  const hasName = form.managerName.trim().length >= 2;
  const hasPhone = PHONE.test(form.managerPhone.trim());

  if (slot.status === "CONFIRMED") {
    if (!hasName)
      errors.managerName = "A confirmed artist needs a manager name";
    if (!hasPhone)
      errors.managerPhone = "A confirmed artist needs a 10 digit mobile number";
  } else if (form.managerPhone.trim() && !hasPhone) {
    errors.managerPhone = "Enter a 10 digit mobile number";
  }

  if (
    form.managerEmail.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.managerEmail.trim())
  ) {
    errors.managerEmail = "Enter a valid email address";
  }

  ["dietaryNotes", "soundRigNotes", "securityNotes"].forEach((name) => {
    if (form[name].length > 300)
      errors[name] = "Keep this under 300 characters";
  });

  return errors;
};
