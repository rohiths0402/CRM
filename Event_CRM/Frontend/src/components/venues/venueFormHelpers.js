export const emptyVenueForm = {
  name: "",
  type: "",
  stateSlug: "",
  city: "",
  address: "",
  lat: "",
  lng: "",
  capacity: "",
  parkingStalls: "",
  baseRent: "",
  greenRooms: "",
  powerBackup: true,
  wheelchairAccess: false,
  fireNocValidTill: "",
  contactName: "",
  contactPhone: "",
};

export const toVenueFormValues = (venue) => ({
  name: venue.name,
  type: venue.type,
  stateSlug: venue.stateSlug,
  city: venue.city,
  address: venue.address,
  lat: String(venue.lat),
  lng: String(venue.lng),
  capacity: String(venue.capacity),
  parkingStalls: String(venue.parkingStalls),
  baseRent: String(venue.baseRent),
  greenRooms: String(venue.greenRooms),
  powerBackup: venue.powerBackup,
  wheelchairAccess: venue.wheelchairAccess,
  fireNocValidTill: venue.fireNocValidTill,
  contactName: venue.contactName,
  contactPhone: venue.contactPhone,
});

export const toVenuePayload = (form) => ({
  name: form.name.trim(),
  type: form.type,
  stateSlug: form.stateSlug,
  city: form.city.trim(),
  address: form.address.trim(),
  lat: Number(form.lat),
  lng: Number(form.lng),
  capacity: Number(form.capacity),
  parkingStalls: Number(form.parkingStalls),
  baseRent: Number(form.baseRent),
  greenRooms: Number(form.greenRooms),
  powerBackup: form.powerBackup,
  wheelchairAccess: form.wheelchairAccess,
  fireNocValidTill: form.fireNocValidTill,
  contactName: form.contactName.trim(),
  contactPhone: form.contactPhone.trim(),
});

const isWhole = (value) => value !== "" && Number.isInteger(Number(value));

export const validateVenue = (form, { venues, events, editing }) => {
  const errors = {};
  const name = form.name.trim().toLowerCase();

  if (name.length < 3)
    errors.name = "Enter the venue name, at least 3 characters";
  else if (
    venues.some(
      (venue) => venue.name.toLowerCase() === name && venue.id !== editing?.id,
    )
  ) {
    errors.name = "A venue with this name already exists";
  }

  if (!form.type) errors.type = "Select the venue type";
  if (!form.stateSlug) errors.stateSlug = "Select the state";
  if (form.city.trim().length < 2) errors.city = "Enter the city";
  if (form.address.trim().length < 10)
    errors.address = "Enter the full address, at least 10 characters";

  const lat = Number(form.lat);
  if (form.lat === "" || Number.isNaN(lat) || lat < 6 || lat > 38) {
    errors.lat = "Enter a latitude between 6 and 38";
  }

  const lng = Number(form.lng);
  if (form.lng === "" || Number.isNaN(lng) || lng < 68 || lng > 98) {
    errors.lng = "Enter a longitude between 68 and 98";
  }

  const capacity = Number(form.capacity);
  if (!isWhole(form.capacity) || capacity <= 0) {
    errors.capacity = "Enter the licensed capacity as a whole number";
  } else if (editing) {
    const allocated = editing.zones.reduce(
      (sum, zone) => sum + zone.capacity,
      0,
    );
    const biggestEvent = Math.max(
      0,
      ...events
        .filter((event) => event.venueId === editing.id)
        .map((event) => event.capacity),
    );
    const minimum = Math.max(allocated, biggestEvent);
    if (capacity < minimum) {
      errors.capacity = `Cannot be lower than ${minimum.toLocaleString("en-IN")}. That many seats are already used by zones or an event.`;
    }
  }

  if (!isWhole(form.parkingStalls) || Number(form.parkingStalls) < 0) {
    errors.parkingStalls = "Enter the number of parking stalls";
  }
  if (!(Number(form.baseRent) > 0))
    errors.baseRent = "Enter the base rent per day";
  if (!isWhole(form.greenRooms) || Number(form.greenRooms) < 0) {
    errors.greenRooms = "Enter the number of green rooms";
  }

  if (!form.fireNocValidTill)
    errors.fireNocValidTill = "Enter the date until the Fire NOC is valid";
  if (form.contactName.trim().length < 2)
    errors.contactName = "Enter the contact person name";
  if (!/^[6-9]\d{9}$/.test(form.contactPhone.trim())) {
    errors.contactPhone = "Enter a 10 digit mobile number";
  }

  return errors;
};
