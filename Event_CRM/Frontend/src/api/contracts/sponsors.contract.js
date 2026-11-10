const deliverableShape = {
  id: "number",
  text: "string, for example Logo on the main LED backdrop",
  dueDate: "string, YYYY-MM-DD, on or before the event date",
  status: "PENDING | IN_REVIEW | DONE",
};

const sponsorShape = {
  id: "number",
  eventId: "number",
  eventTitle: "string, read only",
  eventDate: "string, YYYY-MM-DD, read only",
  eventStatus:
    "DRAFT | ANNOUNCED | TICKETS_LIVE | SOLD_OUT | ONGOING | WRAP, read only",
  brandName: "string",
  industry: "string",
  tier: "TITLE | POWERED_BY | ASSOCIATE",
  contractValue: "number, in rupees",
  amountReceived: "number, in rupees, cannot be more than contractValue",
  paymentStatus:
    "PENDING | PARTIAL | PAID, read only, derived from amountReceived",
  contactName: "string",
  contactEmail: "string",
  contactPhone: "string, 10 digit mobile number",
  contractFile: {
    name: "string, for example pepsi-contract.pdf",
    size: "number, bytes",
    url: "string, download url, or null",
  },
  deliverables: [deliverableShape],
};

const sponsorInput = {
  eventId: sponsorShape.eventId,
  brandName: sponsorShape.brandName,
  industry: sponsorShape.industry,
  tier: sponsorShape.tier,
  contractValue: sponsorShape.contractValue,
  amountReceived: sponsorShape.amountReceived,
  contactName: sponsorShape.contactName,
  contactEmail: sponsorShape.contactEmail,
  contactPhone: sponsorShape.contactPhone,
  contractFile:
    "PDF up to 3 MB. Send as multipart form data, or null for no contract",
  addStandardDeliverables:
    "boolean, only on create, adds the standard checklist of the tier",
};

export const sponsorsContract = {
  list: {
    method: "GET",
    url: "/sponsors",
    headers: { Authorization: "Bearer <token>" },
    response: { sponsors: [sponsorShape] },
  },

  create: {
    method: "POST",
    url: "/sponsors",
    request: sponsorInput,
    response: sponsorShape,
    note: "The event sponsors count is recalculated after this",
    errors: {
      400: "Amount received is more than the contract value, or the event is wrapped",
      409: "The brand is already a sponsor of this event, or the tier limit is reached. Title allows 1 per event and Powered By allows 3.",
    },
  },

  update: {
    method: "PUT",
    url: "/sponsors/{id}",
    request: sponsorInput,
    response: sponsorShape,
    note: "eventId cannot change. Deliverables are not touched by this call.",
    errors: {
      409: "The brand already exists for the event, or the tier limit is reached",
    },
  },

  remove: {
    method: "DELETE",
    url: "/sponsors/{id}",
    role: "ADMIN only",
    errors: {
      409: "Payment is already received from this sponsor",
    },
  },

  addDeliverable: {
    method: "POST",
    url: "/sponsors/{id}/deliverables",
    request: { text: "string", dueDate: "string, YYYY-MM-DD" },
    response: sponsorShape,
    note: "Returns the whole updated sponsor. The new deliverable starts as PENDING.",
    errors: {
      400: "The due date is after the event date",
    },
  },

  updateDeliverable: {
    method: "PUT",
    url: "/sponsors/{id}/deliverables/{deliverableId}",
    request: { text: "string", dueDate: "string, YYYY-MM-DD" },
    response: sponsorShape,
  },

  updateDeliverableStatus: {
    method: "PATCH",
    url: "/sponsors/{id}/deliverables/{deliverableId}",
    request: { status: "PENDING | IN_REVIEW | DONE" },
    response: sponsorShape,
  },

  removeDeliverable: {
    method: "DELETE",
    url: "/sponsors/{id}/deliverables/{deliverableId}",
    response: sponsorShape,
  },
};
