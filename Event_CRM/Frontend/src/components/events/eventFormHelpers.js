import { formatDate, to12Hour, to24Hour } from "../../utils/format";

export const emptyForm = {
  title: "",
  category: "",
  ageRating: "All ages",
  headliner: "",
  description: "",
  bannerUrl: "",
  date: "",
  gatesOpen: "",
  showStart: "",
  curfew: "",
  venueId: "",
  capacity: "",
  budget: "",
  projectedRevenue: "",
};

export const toFormValues = (event) => ({
  title: event.title,
  category: event.category,
  ageRating: event.ageRating,
  headliner: event.headliner || "",
  description: event.description || "",
  bannerUrl: event.bannerUrl || "",
  date: event.date,
  gatesOpen: to24Hour(event.gatesOpen),
  showStart: to24Hour(event.showStart),
  curfew: to24Hour(event.curfew),
  venueId: String(event.venueId),
  capacity: String(event.capacity),
  budget: String(event.budget),
  projectedRevenue: String(event.projectedRevenue),
});

export const toPayload = (form) => ({
  title: form.title.trim(),
  category: form.category,
  ageRating: form.ageRating,
  headliner: form.headliner.trim(),
  description: form.description.trim(),
  bannerUrl: form.bannerUrl,
  venueId: Number(form.venueId),
  date: form.date,
  gatesOpen: to12Hour(form.gatesOpen),
  showStart: to12Hour(form.showStart),
  curfew: to12Hour(form.curfew),
  capacity: Number(form.capacity),
  budget: Number(form.budget),
  projectedRevenue: Number(form.projectedRevenue),
});

const todayIso = () => new Date().toLocaleDateString("en-CA");

export const validateStep = (step, form, { venues, events, editing }) => {
  const errors = {};

  if (step === 0) {
    if (form.title.trim().length < 3)
      errors.title = "Enter the event title, at least 3 characters";
    if (!form.category) errors.category = "Select a category";
    if (!form.ageRating) errors.ageRating = "Select an age rating";
    if (form.description.length > 500)
      errors.description = "Keep the description under 500 characters";
  }

  if (step === 1) {
    if (!form.date) errors.date = "Pick the event date";
    else if (!editing && form.date < todayIso())
      errors.date = "Pick today or a future date";
    if (!form.gatesOpen) errors.gatesOpen = "Enter the gates open time";
    if (!form.showStart) errors.showStart = "Enter the show start time";
    if (!form.curfew) errors.curfew = "Enter the curfew time";
    if (form.gatesOpen && form.showStart && form.gatesOpen >= form.showStart) {
      errors.gatesOpen = "Gates must open before the show starts";
    }
    if (form.curfew && form.curfew === form.showStart) {
      errors.curfew = "Curfew cannot be the same as the show start";
    }
  }

  if (step === 2) {
    const venue = venues?.find((item) => String(item.id) === form.venueId);
    if (!venue) {
      errors.venueId = "Select a venue";
    } else {
      const clash = events.find(
        (item) =>
          item.venueId === venue.id &&
          item.date === form.date &&
          item.id !== editing?.id,
      );
      if (clash)
        errors.venueId = `${venue.name} is already booked on ${formatDate(form.date)} for ${clash.title}`;
    }

    const capacity = Number(form.capacity);
    if (!form.capacity || !Number.isInteger(capacity) || capacity <= 0) {
      errors.capacity = "Enter a whole number of seats";
    } else if (venue && capacity > venue.capacity) {
      errors.capacity = `${venue.name} is licensed for ${venue.capacity.toLocaleString("en-IN")} people only`;
    } else if (editing && capacity < editing.ticketsSold) {
      errors.capacity = `${editing.ticketsSold.toLocaleString("en-IN")} tickets are already sold`;
    }
  }

  if (step === 3) {
    if (!(Number(form.budget) > 0))
      errors.budget = "Enter the production budget";
    if (!(Number(form.projectedRevenue) > 0))
      errors.projectedRevenue = "Enter the projected revenue";
  }

  return errors;
};
