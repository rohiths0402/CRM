import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import Button from "../common/Button";
import Modal from "../common/Modal";
import { SelectField, TextAreaField, TextField } from "../common/FormControls";
import { ticketService } from "../../api/services/ticketService";
import { EVENT_STATUS } from "../../constants/eventStatus";
import {
  GST_RATES,
  LIVE_EVENT_STATUSES,
  TIER_NAME_SUGGESTIONS,
} from "../../constants/ticketing";
import { formatNumber } from "../../utils/format";
import {
  emptyTierForm,
  releasedSeats,
  rupees,
  toTierFormValues,
  toTierPayload,
  validateTier,
} from "./ticketingHelpers";

const gstOptions = GST_RATES.map((rate) => ({
  value: String(rate),
  label: `${rate}% GST`,
}));

const Line = ({ label, value, strong }) => (
  <div className="flex items-center justify-between text-sm">
    <span className={strong ? "font-semibold" : "text-muted"}>{label}</span>
    <span className={strong ? "text-lg font-semibold" : "font-medium"}>
      {value}
    </span>
  </div>
);

const TierFormModal = ({
  open,
  onClose,
  editing,
  defaultEventId,
  events,
  tiers,
  onSaved,
}) => {
  const [form, setForm] = useState(emptyTierForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError("");
    setForm(
      editing
        ? toTierFormValues(editing)
        : { ...emptyTierForm, eventId: defaultEventId || "" },
    );
  }, [open, editing, defaultEventId]);

  const eventChoices = editing
    ? events
    : events.filter((event) => event.status !== "WRAP");
  const event = events.find((item) => String(item.id) === form.eventId);
  const seatsLeft = event
    ? event.capacity - releasedSeats(tiers, event.id, editing?.id)
    : null;
  const priceLocked = Boolean(editing && editing.sold > 0);

  const base = Number(form.price) || 0;
  const gst = (base * Number(form.taxPercentage)) / 100;

  const setField = (name) => (change) => {
    const { value } = change.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = async () => {
    const found = validateTier(form, { tiers, events, editing });
    if (Object.keys(found).length) {
      setErrors(found);
      setSubmitError("Please fix the highlighted fields");
      return;
    }

    setSaving(true);
    setSubmitError("");
    try {
      const payload = toTierPayload(form);
      const saved = editing
        ? await ticketService.updateTier(editing.id, payload)
        : await ticketService.createTier(payload);
      onSaved(saved, editing ? "edit" : "create");
      onClose();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? "Edit ticket tier" : "Create ticket tier"}
      subtitle="A tier is one price level of an event, for example Early Bird or VIP"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={handleSubmit}>
            {editing ? "Save changes" : "Create tier"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <SelectField
          label="Event"
          required
          disabled={Boolean(editing)}
          placeholder="Select the event"
          options={eventChoices.map((item) => ({
            value: String(item.id),
            label: `${item.title} · ${EVENT_STATUS[item.status].label}`,
          }))}
          value={form.eventId}
          onChange={setField("eventId")}
          error={errors.eventId}
          hint={editing ? "The event of a tier cannot be changed" : undefined}
        />

        <TextField
          label="Tier name"
          required
          list="tier-name-suggestions"
          placeholder="Early Bird"
          value={form.name}
          onChange={setField("name")}
          error={errors.name}
        />
        <datalist id="tier-name-suggestions">
          {TIER_NAME_SUGGESTIONS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>

        <TextAreaField
          label="What the buyer gets"
          placeholder="Premium seating, lounge access and a backstage walkthrough"
          value={form.perks}
          onChange={setField("perks")}
          error={errors.perks}
          hint={`${form.perks.length} / 200`}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Base price per ticket"
            type="number"
            min="1"
            required
            prefix="₹"
            placeholder="1500"
            disabled={priceLocked}
            value={form.price}
            onChange={setField("price")}
            error={errors.price}
            hint={
              priceLocked
                ? "Locked because tickets are sold"
                : "Price before GST"
            }
          />
          <SelectField
            label="GST"
            options={gstOptions}
            value={form.taxPercentage}
            onChange={setField("taxPercentage")}
          />
        </div>

        <div className="rounded-2xl border border-line bg-card p-5">
          <div className="space-y-2.5">
            <Line label="Base price" value={rupees(base)} />
            <Line label={`GST at ${form.taxPercentage}%`} value={rupees(gst)} />
            <div className="border-t border-line pt-2.5">
              <Line
                strong
                label="Customer pays per ticket"
                value={rupees(base + gst)}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Tickets released in this tier"
            type="number"
            min="1"
            required
            placeholder="2000"
            value={form.quota}
            onChange={setField("quota")}
            error={errors.quota}
            hint={
              seatsLeft === null
                ? "Select an event first"
                : `${formatNumber(Math.max(seatsLeft, 0))} seats are left to release for this event`
            }
          />
          <TextField
            label="Maximum tickets per order"
            type="number"
            min="1"
            max="20"
            required
            value={form.maxPerOrder}
            onChange={setField("maxPerOrder")}
            error={errors.maxPerOrder}
            hint="Stops one buyer from taking the whole tier"
          />
        </div>

        {event && !LIVE_EVENT_STATUSES.includes(event.status) && (
          <p className="flex items-start gap-2 rounded-xl bg-primary/10 px-4 py-3 text-xs text-muted">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            This event is {EVENT_STATUS[event.status].label}. The tier is saved
            as paused. Move the event to Tickets live in Events Master, then
            switch the tier on.
          </p>
        )}

        {!editing && (
          <p className="text-xs text-muted">
            A new tier is always created as paused. Switch it on when you are
            ready to sell.
          </p>
        )}

        {submitError && (
          <p
            role="alert"
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500"
          >
            {submitError}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default TierFormModal;
