const zoneShape = {
  id: "number",
  name: "string, for example VVIP Lounge A",
  kind: "Lounge | Seated | Standing",
  capacity: "number",
  sold: "number, read only, comes from ticketing",
  fireExits: "number",
  safetyStatus: "VERIFIED | PENDING | ACTION_REQUIRED",
  lastInspection: "string, YYYY-MM-DD, empty if not inspected yet",
};

const venueShape = {
  id: "number",
  name: "string",
  type: "Open ground | Indoor stadium | Stadium | Concert hall | Convention centre",
  city: "string",
  stateSlug: "string, lowercase with hyphens",
  address: "string",
  lat: "number",
  lng: "number",
  capacity: "number, total licensed capacity",
  parkingStalls: "number",
  baseRent: "number, per day in rupees",
  greenRooms: "number",
  powerBackup: "boolean",
  wheelchairAccess: "boolean",
  fireNocValidTill: "string, YYYY-MM-DD",
  contactName: "string",
  contactPhone: "string, 10 digit mobile number",
  eventsCount: "number, events booked at this venue",
  zones: [zoneShape],
};

const venueInput = {
  name: venueShape.name,
  type: venueShape.type,
  city: venueShape.city,
  stateSlug: venueShape.stateSlug,
  address: venueShape.address,
  lat: venueShape.lat,
  lng: venueShape.lng,
  capacity: venueShape.capacity,
  parkingStalls: venueShape.parkingStalls,
  baseRent: venueShape.baseRent,
  greenRooms: venueShape.greenRooms,
  powerBackup: venueShape.powerBackup,
  wheelchairAccess: venueShape.wheelchairAccess,
  fireNocValidTill: venueShape.fireNocValidTill,
  contactName: venueShape.contactName,
  contactPhone: venueShape.contactPhone,
};

const zoneInput = {
  name: zoneShape.name,
  kind: zoneShape.kind,
  capacity: zoneShape.capacity,
  fireExits: zoneShape.fireExits,
  safetyStatus: zoneShape.safetyStatus,
  lastInspection: zoneShape.lastInspection,
};

export const venuesContract = {
  list: {
    method: "GET",
    url: "/venues",
    headers: { Authorization: "Bearer <token>" },
    response: { venues: [venueShape] },
  },

  create: {
    method: "POST",
    url: "/venues",
    request: venueInput,
    response: venueShape,
    note: "A new venue starts with no zones",
  },

  update: {
    method: "PUT",
    url: "/venues/{id}",
    request: venueInput,
    response: venueShape,
    errors: {
      400: "Capacity is lower than an event booked here or lower than the seats already allocated to zones",
    },
  },

  remove: {
    method: "DELETE",
    url: "/venues/{id}",
    role: "ADMIN only",
    errors: {
      409: "Venue has events booked",
    },
  },

  addZone: {
    method: "POST",
    url: "/venues/{id}/zones",
    request: zoneInput,
    response: venueShape,
    note: "Returns the whole updated venue",
    errors: {
      400: "Total zone capacity is more than the venue licensed capacity",
    },
  },

  updateZone: {
    method: "PUT",
    url: "/venues/{id}/zones/{zoneId}",
    request: zoneInput,
    response: venueShape,
    note: "Returns the whole updated venue",
    errors: {
      400: "Capacity is lower than tickets already sold, or total is more than the licensed capacity",
    },
  },

  removeZone: {
    method: "DELETE",
    url: "/venues/{id}/zones/{zoneId}",
    response: venueShape,
    note: "Returns the whole updated venue",
    errors: {
      409: "Zone has tickets sold",
    },
  },
};
