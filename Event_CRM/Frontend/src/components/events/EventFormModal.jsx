import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check } from "lucide-react";
import Button from "../common/Button";
import Modal from "../common/Modal";
import { SelectField, TextAreaField, TextField } from "../common/FormControls";
import PosterUpload from "./PosterUpload";
import { eventService } from "../../api/services/eventService";
import { AGE_RATINGS, EVENT_CATEGORIES } from "../../constants/eventOptions";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
} from "../../utils/format";
import {
  emptyForm,
  toFormValues,
  toPayload,
  validateStep,
} from "./eventFormHelpers";

const STEPS = ["Basic info", "Schedule", "Venue", "Budget"];

const toOptions = (list) => list.map((item) => ({ value: item, label: item }));

const Fact = ({ label, value }) => (
  <div>
    <p className="text-xs text-muted">{label}</p>
    <p className="mt-0.5 text-sm font-semibold">{value}</p>
  </div>
);

const EventFormModal = ({
  open,
  onClose,
  editing,
  events,
  venues,
  onSaved,
}) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setErrors({});
    setSubmitError("");
    setForm(editing ? toFormValues(editing) : emptyForm);
  }, [open, editing]);

  const context = { venues, events, editing };
  const venue = venues?.find((item) => String(item.id) === form.venueId);
  const nocExpired = Boolean(
    venue && form.date && venue.fireNocValidTill < form.date,
  );

  const budget = Number(form.budget) || 0;
  const revenue = Number(form.projectedRevenue) || 0;
  const profit = revenue - budget;

  const setField = (name) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError("");
  };

  const setPoster = (value) =>
    setForm((current) => ({ ...current, bannerUrl: value }));

  const handleVenueChange = (event) => {
    const { value } = event.target;
    const picked = venues.find((item) => String(item.id) === value);
    setForm((current) => ({
      ...current,
      venueId: value,
      capacity:
        picked && (!editing || !current.capacity)
          ? String(picked.capacity)
          : current.capacity,
    }));
    setErrors((current) => ({
      ...current,
      venueId: undefined,
      capacity: undefined,
    }));
    setSubmitError("");
  };

  const goNext = () => {
    const found = validateStep(step, form, context);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setErrors({});
    setStep((current) => current + 1);
  };

  const goBack = () => {
    setErrors({});
    setStep((current) => current - 1);
  };

  const handleSubmit = async () => {
    for (let index = 0; index < STEPS.length; index += 1) {
      const found = validateStep(index, form, context);
      if (Object.keys(found).length) {
        setStep(index);
        setErrors(found);
        return;
      }
    }

    setSaving(true);
    setSubmitError("");
    try {
      const payload = toPayload(form);
      const saved = editing
        ? await eventService.update(editing.id, payload)
        : await eventService.create(payload);
      onSaved(saved, editing ? "edit" : "create");
      onClose();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isLast = step === STEPS.length - 1;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? "Edit event" : "Create new event"}
      subtitle={`Step ${step + 1} of ${STEPS.length}, ${STEPS[step]}`}
      footer={
        <>
          <Button variant="ghost" onClick={step === 0 ? onClose : goBack}>
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {isLast ? (
            <Button loading={saving} onClick={handleSubmit}>
              {editing ? "Save changes" : "Create event"}
            </Button>
          ) : (
            <Button onClick={goNext}>Continue</Button>
          )}
        </>
      }
    >
      <ol className="mb-8 flex items-center">
        {STEPS.map((label, index) => (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={index > step}
              onClick={() => setStep(index)}
              className="flex items-center gap-2 disabled:cursor-default"
            >
              <span
                className={`grid size-8 place-items-center rounded-full text-xs font-bold transition ${
                  index < step
                    ? "bg-primary text-on-primary"
                    : index === step
                      ? "border-2 border-primary text-primary"
                      : "border border-line text-muted"
                }`}
              >
                {index < step ? <Check className="size-4" /> : index + 1}
              </span>
              <span
                className={`hidden text-sm font-medium sm:block ${index === step ? "" : "text-muted"}`}
              >
                {label}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <span
                className={`mx-3 h-px flex-1 ${index < step ? "bg-primary" : "bg-line"}`}
              />
            )}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.18 }}
          className="space-y-5"
        >
          {step === 0 && (
            <>
              <TextField
                label="Event title"
                required
                placeholder="LOOP Music Festival 2026"
                value={form.title}
                onChange={setField("title")}
                error={errors.title}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Category"
                  required
                  placeholder="Select category"
                  options={toOptions(EVENT_CATEGORIES)}
                  value={form.category}
                  onChange={setField("category")}
                  error={errors.category}
                />
                <SelectField
                  label="Age rating"
                  required
                  options={toOptions(AGE_RATINGS)}
                  value={form.ageRating}
                  onChange={setField("ageRating")}
                  error={errors.ageRating}
                />
              </div>
              <TextField
                label="Headliner or main attraction"
                placeholder="Anirudh Ravichander"
                value={form.headliner}
                onChange={setField("headliner")}
              />
              <TextAreaField
                label="Description"
                placeholder="A short note about the event for your team"
                value={form.description}
                onChange={setField("description")}
                error={errors.description}
                hint={`${form.description.length} / 500`}
              />
              <PosterUpload value={form.bannerUrl} onChange={setPoster} />
            </>
          )}

          {step === 1 && (
            <>
              <TextField
                label="Event date"
                type="date"
                required
                min={
                  editing ? undefined : new Date().toLocaleDateString("en-CA")
                }
                value={form.date}
                onChange={setField("date")}
                error={errors.date}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <TextField
                  label="Gates open"
                  type="time"
                  required
                  value={form.gatesOpen}
                  onChange={setField("gatesOpen")}
                  error={errors.gatesOpen}
                />
                <TextField
                  label="Show starts"
                  type="time"
                  required
                  value={form.showStart}
                  onChange={setField("showStart")}
                  error={errors.showStart}
                />
                <TextField
                  label="Curfew or wrap time"
                  type="time"
                  required
                  value={form.curfew}
                  onChange={setField("curfew")}
                  error={errors.curfew}
                />
              </div>
              <p className="text-xs text-muted">
                If the show ends after midnight, pick the early morning time for
                curfew. It counts as the next day.
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <SelectField
                label="Venue"
                required
                placeholder={
                  venues ? "Select a venue from Venue Master" : "Loading venues"
                }
                options={(venues || []).map((item) => ({
                  value: String(item.id),
                  label: `${item.name} · ${item.city}`,
                }))}
                value={form.venueId}
                onChange={handleVenueChange}
                error={errors.venueId}
              />

              {venue && (
                <div className="rounded-2xl border border-line bg-card p-5">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <Fact label="City" value={venue.city} />
                    <Fact
                      label="Licensed capacity"
                      value={formatNumber(venue.capacity)}
                    />
                    <Fact
                      label="Base rent per day"
                      value={formatCurrency(venue.baseRent)}
                    />
                    <Fact label="Green rooms" value={venue.greenRooms} />
                    <Fact
                      label="Parking stalls"
                      value={formatNumber(venue.parkingStalls)}
                    />
                    <Fact
                      label="Fire NOC valid till"
                      value={formatDate(venue.fireNocValidTill)}
                    />
                  </div>
                  {nocExpired && (
                    <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-500/12 px-3 py-2.5 text-xs text-amber-500">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      The Fire NOC of this venue expires before the event date.
                      Renew it before ticket sales go live.
                    </p>
                  )}
                </div>
              )}

              <TextField
                label="Seats made available for this event"
                type="number"
                min="1"
                required
                value={form.capacity}
                onChange={setField("capacity")}
                error={errors.capacity}
                hint={
                  venue
                    ? `Up to ${formatNumber(venue.capacity)} seats for this venue`
                    : "Pick a venue first"
                }
              />
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Target production budget"
                  type="number"
                  min="0"
                  required
                  prefix="₹"
                  placeholder="18000000"
                  value={form.budget}
                  onChange={setField("budget")}
                  error={errors.budget}
                  hint={
                    venue
                      ? `Venue rent here is ${formatCurrency(venue.baseRent)} per day`
                      : undefined
                  }
                />
                <TextField
                  label="Projected revenue"
                  type="number"
                  min="0"
                  required
                  prefix="₹"
                  placeholder="45000000"
                  value={form.projectedRevenue}
                  onChange={setField("projectedRevenue")}
                  error={errors.projectedRevenue}
                  hint="Tickets and sponsorships together"
                />
              </div>

              <div className="rounded-2xl border border-line bg-card p-5">
                <p className="text-sm font-semibold">Projected result</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Fact
                    label="Projected profit"
                    value={
                      formatCurrency(Math.abs(profit)) +
                      (profit < 0 ? " loss" : "")
                    }
                  />
                  <Fact
                    label="Margin"
                    value={`${formatPercent(profit, revenue)}%`}
                  />
                </div>
                <p
                  className={`mt-4 text-xs ${profit < 0 ? "text-rose-500" : "text-emerald-500"}`}
                >
                  {profit < 0
                    ? "The budget is higher than the projected revenue. Check the numbers."
                    : "Revenue covers the budget."}
                </p>
              </div>

              <p className="text-xs text-muted">
                {editing
                  ? "Your changes are saved to this event."
                  : "The new event is created as a draft. You can move it to Announced once you are ready."}
              </p>
            </>
          )}

          {submitError && (
            <p
              role="alert"
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500"
            >
              {submitError}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
};

export default EventFormModal;
