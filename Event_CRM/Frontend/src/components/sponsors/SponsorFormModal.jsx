import { useEffect, useState } from "react";
import Button from "../common/Button";
import CheckboxField from "../common/CheckboxField";
import Modal from "../common/Modal";
import { SelectField, TextField } from "../common/FormControls";
import ContractUpload from "./ContractUpload";
import { sponsorService } from "../../api/services/sponsorService";
import { EVENT_STATUS } from "../../constants/eventStatus";
import {
  DELIVERABLE_TEMPLATES,
  INDUSTRIES,
  PAYMENT_STATUS,
  SPONSOR_TIERS,
} from "../../constants/sponsors";
import {
  emptySponsorForm,
  previewPaymentStatus,
  rupees,
  toSponsorFormValues,
  toSponsorPayload,
  validateSponsor,
} from "./sponsorHelpers";

const industryOptions = INDUSTRIES.map((item) => ({
  value: item,
  label: item,
}));
const tierOptions = Object.entries(SPONSOR_TIERS).map(([value, { label }]) => ({
  value,
  label,
}));

const SectionTitle = ({ children }) => (
  <p className="border-b border-line pb-2 text-sm font-semibold">{children}</p>
);

const SponsorFormModal = ({
  open,
  onClose,
  editing,
  defaultEventId,
  events,
  sponsors,
  onSaved,
}) => {
  const [form, setForm] = useState(emptySponsorForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError("");
    setForm(
      editing
        ? toSponsorFormValues(editing)
        : { ...emptySponsorForm, eventId: defaultEventId || "" },
    );
  }, [open, editing, defaultEventId]);

  const eventChoices = events.filter(
    (event) => editing || event.status !== "WRAP",
  );
  const event = events.find((item) => String(item.id) === form.eventId);
  const tier = form.tier ? SPONSOR_TIERS[form.tier] : null;

  const taken =
    event && form.tier
      ? sponsors.filter(
          (sponsor) =>
            sponsor.eventId === event.id &&
            sponsor.tier === form.tier &&
            sponsor.id !== editing?.id,
        ).length
      : 0;

  const tierHint =
    tier && event && tier.limit !== null
      ? `${taken} of ${tier.limit} slots taken for this event`
      : tier?.hint;

  const value = Number(form.contractValue) || 0;
  const received = Number(form.amountReceived) || 0;
  const payment = PAYMENT_STATUS[previewPaymentStatus(form)];

  const setField = (name) => (change) => {
    const { value: next } = change.target;
    setForm((current) => ({ ...current, [name]: next }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = async () => {
    const found = validateSponsor(form, { sponsors, events, editing });
    if (Object.keys(found).length) {
      setErrors(found);
      setSubmitError("Please fix the highlighted fields");
      return;
    }

    setSaving(true);
    setSubmitError("");
    try {
      const payload = toSponsorPayload(form, editing);
      const saved = editing
        ? await sponsorService.update(editing.id, payload)
        : await sponsorService.create(payload);
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
      size="xl"
      title={editing ? "Edit sponsor" : "Onboard brand sponsor"}
      subtitle="Sponsor details, contract value, payment and contact in one place"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={handleSubmit}>
            {editing ? "Save changes" : "Onboard sponsor"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <section className="space-y-4">
          <SectionTitle>Event and brand</SectionTitle>
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
            hint={
              editing ? "The event of a sponsor cannot be changed" : undefined
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Brand name"
              required
              placeholder="Pepsi"
              value={form.brandName}
              onChange={setField("brandName")}
              error={errors.brandName}
            />
            <SelectField
              label="Industry"
              required
              placeholder="Select industry"
              options={industryOptions}
              value={form.industry}
              onChange={setField("industry")}
              error={errors.industry}
            />
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>Sponsorship tier and money</SectionTitle>
          <SelectField
            label="Sponsor tier"
            required
            placeholder="Select tier"
            options={tierOptions}
            value={form.tier}
            onChange={setField("tier")}
            error={errors.tier}
            hint={tierHint}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Contract value"
              type="number"
              min="1"
              required
              prefix="₹"
              placeholder="12500000"
              value={form.contractValue}
              onChange={setField("contractValue")}
              error={errors.contractValue}
            />
            <TextField
              label="Amount received so far"
              type="number"
              min="0"
              prefix="₹"
              placeholder="0"
              value={form.amountReceived}
              onChange={setField("amountReceived")}
              error={errors.amountReceived}
              hint="Leave empty if nothing is received yet"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 py-3">
            <p className="text-sm text-muted">
              Balance to collect{" "}
              <span className="font-semibold text-foreground">
                {rupees(Math.max(value - received, 0))}
              </span>
            </p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${payment.tone}`}
            >
              {payment.label}
            </span>
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>Brand contact</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Contact person"
              required
              placeholder="Rohan Mehta"
              value={form.contactName}
              onChange={setField("contactName")}
              error={errors.contactName}
            />
            <TextField
              label="Mobile number"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              required
              placeholder="9876543210"
              value={form.contactPhone}
              onChange={setField("contactPhone")}
              error={errors.contactPhone}
            />
          </div>
          <TextField
            label="Email"
            type="email"
            required
            placeholder="partnerships@brand.com"
            value={form.contactEmail}
            onChange={setField("contactEmail")}
            error={errors.contactEmail}
          />
        </section>

        <section className="space-y-4">
          <SectionTitle>Contract and deliverables</SectionTitle>
          <ContractUpload
            value={form.contractFile}
            onChange={(file) =>
              setForm((current) => ({ ...current, contractFile: file }))
            }
          />
          {!editing && (
            <CheckboxField
              label="Add the standard deliverables for this tier"
              hint={
                form.tier
                  ? `${DELIVERABLE_TEMPLATES[form.tier].length} items are added to the checklist, you can edit them later`
                  : "Select a tier to see how many items are added"
              }
              checked={form.addStandardDeliverables}
              onChange={(change) =>
                setForm((current) => ({
                  ...current,
                  addStandardDeliverables: change.target.checked,
                }))
              }
            />
          )}
        </section>

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

export default SponsorFormModal;
