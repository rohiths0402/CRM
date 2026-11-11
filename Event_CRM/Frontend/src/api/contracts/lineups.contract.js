const riderItemShape = {
  id: "number",
  label: "string, for example Sound rig and backline confirmed",
  category: "DIETARY | SOUND | SECURITY | HOSPITALITY | TRAVEL",
  status: "PENDING | CONFIRMED | READY",
};

const slotShape = {
  id: "number",
  eventId: "number",
  artistName: "string",
  role: "Headliner | Support act | Opening act | DJ set | Dance troupe | Stand-up comedian | Anchor / MC | Guest appearance",
  stage: "string, for example Main Arena",
  start:
    "string, HH:mm in 24 hour format. A time before the gates open time means the next day, for example 00:10",
  end: "string, HH:mm in 24 hour format",
  soundcheck: "string, HH:mm, or empty. Required for a Headliner",
  greenRoom: "number, from 1 to the venue greenRooms count, or null",
  status: "TENTATIVE | CONFIRMED | CANCELLED",
  fee: "number, in rupees",
  advancePaid: "number, in rupees, cannot be more than fee",
  managerName: "string",
  managerPhone: "string, 10 digit mobile number",
  managerEmail: "string, optional",
  dietaryNotes: "string",
  soundRigNotes: "string",
  securityNotes: "string",
  escortRequired: "boolean",
  riderItems: [riderItemShape],
};

const slotInput = {
  eventId: slotShape.eventId,
  artistName: slotShape.artistName,
  role: slotShape.role,
  stage: slotShape.stage,
  start: slotShape.start,
  end: slotShape.end,
  soundcheck: slotShape.soundcheck,
  greenRoom: slotShape.greenRoom,
  status: slotShape.status,
  fee: slotShape.fee,
  advancePaid: slotShape.advancePaid,
  managerName: slotShape.managerName,
  managerPhone: slotShape.managerPhone,
  addStandardRider:
    "boolean, only on create, adds the standard rider checklist",
};

const scheduleRules = [
  "Set must be inside the window from gates open to curfew of the event",
  "Set must be at least 10 minutes long",
  "Two acts on the same stage need at least 10 minutes between them",
  "The same artist cannot perform in two places at the same time",
  "Soundcheck takes 30 minutes, must finish before gates open and cannot overlap another soundcheck on the same stage",
  "A green room cannot hold two different artists at the same time. Occupancy runs from the soundcheck, or one hour before the set, until the set ends.",
  "Cancelled slots are ignored by all rules above",
];

export const lineupsContract = {
  list: {
    method: "GET",
    url: "/lineups",
    headers: { Authorization: "Bearer <token>" },
    query: { eventId: "number, optional" },
    response: { slots: [slotShape] },
  },

  create: {
    method: "POST",
    url: "/lineups",
    request: slotInput,
    response: slotShape,
    rules: scheduleRules,
    errors: {
      400: "A schedule rule is broken, the advance is more than the fee, or a confirmed artist has no manager contact",
      409: "The event is wrapped, so the lineup is locked",
    },
  },

  update: {
    method: "PUT",
    url: "/lineups/{id}",
    request: slotInput,
    response: slotShape,
    note: "eventId cannot change. The rider checklist is not touched by this call.",
    rules: scheduleRules,
  },

  remove: {
    method: "DELETE",
    url: "/lineups/{id}",
    role: "ADMIN only",
    errors: {
      409: "An advance is already paid, mark the slot as CANCELLED instead",
    },
  },

  updateRider: {
    method: "PUT",
    url: "/lineups/{id}/rider",
    request: {
      managerName: "string",
      managerPhone: "string, 10 digit mobile number",
      managerEmail: "string, optional",
      dietaryNotes: "string",
      soundRigNotes: "string",
      securityNotes: "string",
      escortRequired: "boolean",
    },
    response: slotShape,
  },

  addRiderItem: {
    method: "POST",
    url: "/lineups/{id}/rider-items",
    request: {
      label: "string",
      category: "DIETARY | SOUND | SECURITY | HOSPITALITY | TRAVEL",
    },
    response: slotShape,
    note: "Returns the whole updated slot. The new item starts as PENDING.",
  },

  updateRiderItemStatus: {
    method: "PATCH",
    url: "/lineups/{id}/rider-items/{itemId}",
    request: { status: "PENDING | CONFIRMED | READY" },
    response: slotShape,
  },

  removeRiderItem: {
    method: "DELETE",
    url: "/lineups/{id}/rider-items/{itemId}",
    response: slotShape,
  },
};
