import { to24Hour } from "./format";

const DAY = 1440;

export const CHANGEOVER = 10;
export const SOUNDCHECK_BLOCK = 30;
export const MIN_SET = 10;

export const toMinutes = (time) => {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const clock = (minutes) => {
  const total = ((minutes % DAY) + DAY) % DAY;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  const period = hours >= 12 ? "PM" : "AM";
  return `${String(hours % 12 || 12).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${period}`;
};

export const duration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins}m`;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
};

export const eventWindow = (event) => {
  const gates = toMinutes(to24Hour(event.gatesOpen));
  let curfew = toMinutes(to24Hour(event.curfew));
  if (curfew <= gates) curfew += DAY;
  return { gates, curfew };
};

const normalize = (minutes, gates) =>
  minutes < gates ? minutes + DAY : minutes;

export const spanOf = (slot, gates) => ({
  start: normalize(toMinutes(slot.start), gates),
  end: normalize(toMinutes(slot.end), gates),
});

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

const sameText = (first, second) =>
  first.trim().toLowerCase() === second.trim().toLowerCase();

const occupancy = (slot, start, end) => {
  const checkIn = slot.soundcheck ? toMinutes(slot.soundcheck) : start - 60;
  return { from: checkIn, to: end };
};

export const findSlotProblems = (slot, { event, venue, slots, ignoreId }) => {
  const errors = {};
  if (slot.status === "CANCELLED") return errors;

  const { gates, curfew } = eventWindow(event);
  const { start, end } = spanOf(slot, gates);
  const others = slots.filter(
    (item) =>
      item.eventId === event.id &&
      item.id !== ignoreId &&
      item.status !== "CANCELLED",
  );

  if (end <= start) errors.end = "The set must end after it starts";
  else if (end - start < MIN_SET)
    errors.end = `A set must be at least ${MIN_SET} minutes long`;

  if (start >= curfew) {
    errors.start = `Must start between gates open at ${clock(gates)} and curfew at ${clock(curfew)}`;
  }
  if (!errors.end && end > curfew)
    errors.end = `Must finish before curfew at ${clock(curfew)}`;

  const checkTime = slot.soundcheck ? toMinutes(slot.soundcheck) : null;

  if (slot.role === "Headliner" && checkTime === null) {
    errors.soundcheck = "A headliner needs a soundcheck time";
  }

  if (checkTime !== null) {
    if (checkTime + SOUNDCHECK_BLOCK > gates) {
      errors.soundcheck = `Soundcheck must finish before gates open at ${clock(gates)}`;
    } else {
      const clash = others.find(
        (item) =>
          item.soundcheck &&
          sameText(item.stage, slot.stage) &&
          overlaps(
            checkTime,
            checkTime + SOUNDCHECK_BLOCK,
            toMinutes(item.soundcheck),
            toMinutes(item.soundcheck) + SOUNDCHECK_BLOCK,
          ),
      );
      if (clash) {
        const clashStart = toMinutes(clash.soundcheck);
        errors.soundcheck = `${clash.artistName} has a soundcheck on ${clash.stage} from ${clock(clashStart)} to ${clock(clashStart + SOUNDCHECK_BLOCK)}`;
      }
    }
  }

  if (errors.start || errors.end) return errors;

  const stageClash = others.find((item) => {
    if (!sameText(item.stage, slot.stage)) return false;
    const span = spanOf(item, gates);
    return start < span.end + CHANGEOVER && span.start < end + CHANGEOVER;
  });
  if (stageClash) {
    const span = spanOf(stageClash, gates);
    errors.stage = `Clashes with ${stageClash.artistName} (${clock(span.start)} to ${clock(span.end)}) on ${stageClash.stage}. Keep ${CHANGEOVER} minutes for changeover.`;
  }

  const doubleBooked = others.find((item) => {
    if (!sameText(item.artistName, slot.artistName)) return false;
    const span = spanOf(item, gates);
    return overlaps(start, end, span.start, span.end);
  });
  if (doubleBooked) {
    const span = spanOf(doubleBooked, gates);
    errors.artistName = `${slot.artistName.trim()} is already performing on ${doubleBooked.stage} from ${clock(span.start)} to ${clock(span.end)}`;
  }

  if (
    slot.greenRoom !== null &&
    slot.greenRoom !== undefined &&
    slot.greenRoom !== ""
  ) {
    const room = Number(slot.greenRoom);

    if (!venue?.greenRooms) {
      errors.greenRoom = `${venue?.name || "This venue"} has no green rooms`;
    } else if (!Number.isInteger(room) || room < 1 || room > venue.greenRooms) {
      errors.greenRoom = `${venue.name} has ${venue.greenRooms} green rooms, pick 1 to ${venue.greenRooms}`;
    } else {
      const mine = occupancy(slot, start, end);
      const roomClash = others.find((item) => {
        if (
          Number(item.greenRoom) !== room ||
          sameText(item.artistName, slot.artistName)
        )
          return false;
        const span = spanOf(item, gates);
        const theirs = occupancy(item, span.start, span.end);
        return overlaps(mine.from, mine.to, theirs.from, theirs.to);
      });
      if (roomClash) {
        const span = spanOf(roomClash, gates);
        const theirs = occupancy(roomClash, span.start, span.end);
        errors.greenRoom = `Green room ${room} is used by ${roomClash.artistName} from ${clock(theirs.from)} to ${clock(theirs.to)}`;
      }
    }
  }

  return errors;
};
