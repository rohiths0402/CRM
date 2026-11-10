export const emptyZoneForm = {
  name: "",
  kind: "",
  capacity: "",
  fireExits: "",
  safetyStatus: "PENDING",
  lastInspection: "",
};

export const toZoneFormValues = (zone) => ({
  name: zone.name,
  kind: zone.kind,
  capacity: String(zone.capacity),
  fireExits: String(zone.fireExits),
  safetyStatus: zone.safetyStatus,
  lastInspection: zone.lastInspection || "",
});

export const toZonePayload = (form) => ({
  name: form.name.trim(),
  kind: form.kind,
  capacity: Number(form.capacity),
  fireExits: Number(form.fireExits),
  safetyStatus: form.safetyStatus,
  lastInspection: form.lastInspection,
});

export const seatsLeft = (venue, ignoreZoneId) =>
  venue.capacity -
  venue.zones
    .filter((zone) => zone.id !== ignoreZoneId)
    .reduce((sum, zone) => sum + zone.capacity, 0);

export const validateZone = (form, { venue, editing }) => {
  const errors = {};
  const name = form.name.trim().toLowerCase();

  if (name.length < 2) errors.name = "Enter the zone name";
  else if (
    venue.zones.some(
      (zone) => zone.name.toLowerCase() === name && zone.id !== editing?.id,
    )
  ) {
    errors.name = "This venue already has a zone with this name";
  }

  if (!form.kind) errors.kind = "Select the zone type";

  const capacity = Number(form.capacity);
  const room = seatsLeft(venue, editing?.id);
  if (form.capacity === "" || !Number.isInteger(capacity) || capacity <= 0) {
    errors.capacity = "Enter the number of seats as a whole number";
  } else if (capacity > room) {
    errors.capacity = `Only ${room.toLocaleString("en-IN")} seats are left to allocate`;
  } else if (editing && capacity < editing.sold) {
    errors.capacity = `${editing.sold.toLocaleString("en-IN")} tickets are already sold in this zone`;
  }

  const exits = Number(form.fireExits);
  if (form.fireExits === "" || !Number.isInteger(exits) || exits < 1) {
    errors.fireExits = "Every zone needs at least 1 fire exit";
  }

  if (form.safetyStatus === "VERIFIED" && !form.lastInspection) {
    errors.lastInspection = "Enter the inspection date for a verified zone";
  }
  if (
    form.lastInspection &&
    form.lastInspection > new Date().toLocaleDateString("en-CA")
  ) {
    errors.lastInspection = "The inspection date cannot be in the future";
  }

  return errors;
};
