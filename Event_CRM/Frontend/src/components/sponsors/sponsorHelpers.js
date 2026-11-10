import { SPONSOR_TIERS, paymentStatusFor } from "../../constants/sponsors";
import { formatNumber } from "../../utils/format";

export const MAX_CONTRACT_SIZE = 3 * 1024 * 1024;

export const todayIso = () => new Date().toLocaleDateString("en-CA");

export const rupees = (value) => `₹ ${formatNumber(Math.round(value))}`;

export const isOverdue = (deliverable) =>
  deliverable.status !== "DONE" && deliverable.dueDate < todayIso();

export const deliverableStats = (sponsor) => {
  const total = sponsor.deliverables.length;
  const done = sponsor.deliverables.filter(
    (item) => item.status === "DONE",
  ).length;
  const inReview = sponsor.deliverables.filter(
    (item) => item.status === "IN_REVIEW",
  ).length;
  const overdue = sponsor.deliverables.filter(isOverdue).length;

  return {
    total,
    done,
    inReview,
    pending: total - done - inReview,
    overdue,
    percent: total ? Math.round((done / total) * 100) : 0,
  };
};

export const fileSize = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;

export const emptySponsorForm = {
  eventId: "",
  brandName: "",
  industry: "",
  tier: "",
  contractValue: "",
  amountReceived: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  contractFile: null,
  addStandardDeliverables: true,
};

export const toSponsorFormValues = (sponsor) => ({
  eventId: String(sponsor.eventId),
  brandName: sponsor.brandName,
  industry: sponsor.industry,
  tier: sponsor.tier,
  contractValue: String(sponsor.contractValue),
  amountReceived: String(sponsor.amountReceived),
  contactName: sponsor.contactName,
  contactEmail: sponsor.contactEmail,
  contactPhone: sponsor.contactPhone,
  contractFile: sponsor.contractFile,
  addStandardDeliverables: false,
});

export const toSponsorPayload = (form, editing) => {
  const payload = {
    eventId: Number(form.eventId),
    brandName: form.brandName.trim(),
    industry: form.industry,
    tier: form.tier,
    contractValue: Number(form.contractValue),
    amountReceived: Number(form.amountReceived) || 0,
    contactName: form.contactName.trim(),
    contactEmail: form.contactEmail.trim(),
    contactPhone: form.contactPhone.trim(),
    contractFile: form.contractFile,
  };

  if (!editing) payload.addStandardDeliverables = form.addStandardDeliverables;
  return payload;
};

export const previewPaymentStatus = (form) =>
  paymentStatusFor(
    Number(form.amountReceived) || 0,
    Number(form.contractValue) || 0,
  );

export const validateSponsor = (form, { sponsors, events, editing }) => {
  const errors = {};
  const event = events.find((item) => String(item.id) === form.eventId);

  if (!event) errors.eventId = "Select the event";
  else if (!editing && event.status === "WRAP")
    errors.eventId = "This event is wrapped, so no new sponsors can be added";

  const brand = form.brandName.trim();
  if (brand.length < 2) errors.brandName = "Enter the brand name";
  else if (
    event &&
    sponsors.some(
      (sponsor) =>
        sponsor.eventId === event.id &&
        sponsor.id !== editing?.id &&
        sponsor.brandName.toLowerCase() === brand.toLowerCase(),
    )
  ) {
    errors.brandName = `${brand} is already a sponsor of this event`;
  }

  if (!form.industry) errors.industry = "Select the industry";

  if (!form.tier) {
    errors.tier = "Select the sponsor tier";
  } else if (event) {
    const limit = SPONSOR_TIERS[form.tier].limit;
    const taken = sponsors.filter(
      (sponsor) =>
        sponsor.eventId === event.id &&
        sponsor.tier === form.tier &&
        sponsor.id !== editing?.id,
    ).length;
    if (limit !== null && taken >= limit) {
      errors.tier = `This event already has the maximum of ${limit} ${SPONSOR_TIERS[form.tier].label}`;
    }
  }

  const value = Number(form.contractValue);
  if (form.contractValue === "" || Number.isNaN(value) || value <= 0) {
    errors.contractValue = "Enter the contract value";
  }

  const received = form.amountReceived === "" ? 0 : Number(form.amountReceived);
  if (Number.isNaN(received) || received < 0) {
    errors.amountReceived =
      "Enter the amount received so far, or leave it empty";
  } else if (value > 0 && received > value) {
    errors.amountReceived = `Cannot be more than the contract value, ${rupees(value)}`;
  }

  if (form.contactName.trim().length < 2)
    errors.contactName = "Enter the contact person name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim()))
    errors.contactEmail = "Enter a valid email address";
  if (!/^[6-9]\d{9}$/.test(form.contactPhone.trim()))
    errors.contactPhone = "Enter a 10 digit mobile number";

  return errors;
};

export const emptyDeliverableForm = { text: "", dueDate: "" };

export const toDeliverableFormValues = (deliverable) => ({
  text: deliverable.text,
  dueDate: deliverable.dueDate,
});

export const validateDeliverable = (form, { sponsor, editing }) => {
  const errors = {};
  const text = form.text.trim();

  if (text.length < 5)
    errors.text = "Describe the deliverable, at least 5 characters";
  else if (
    sponsor.deliverables.some(
      (item) =>
        item.id !== editing?.id &&
        item.text.toLowerCase() === text.toLowerCase(),
    )
  ) {
    errors.text = "This deliverable is already on the list";
  }

  if (!form.dueDate) errors.dueDate = "Pick the due date";
  else if (form.dueDate > sponsor.eventDate)
    errors.dueDate = "Must be on or before the event date";

  return errors;
};
