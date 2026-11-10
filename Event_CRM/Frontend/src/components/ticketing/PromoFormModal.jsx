import { useEffect, useState } from "react";
import Button from "../common/Button";
import Modal from "../common/Modal";
import { SelectField, TextField } from "../common/FormControls";
import { ticketService } from "../../api/services/ticketService";
import { DISCOUNT_TYPES } from "../../constants/ticketing";
import {
  emptyPromoForm,
  rupees,
  todayIso,
  toPromoFormValues,
  toPromoPayload,
  validatePromo,
} from "./ticketingHelpers";

const PromoFormModal = ({
  open,
  onClose,
  editing,
  defaultEventId,
  events,
  tiers,
  promos,
  onSaved,
}) => {
  const [form, setForm] = useState(emptyPromoForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError("");
    setForm(
      editing
        ? toPromoFormValues(editing)
        : { ...emptyPromoForm, eventId: defaultEventId || "all" },
    );
  }, [open, editing, defaultEventId]);

  const prices = tiers
    .filter(
      (tier) => form.eventId === "all" || String(tier.eventId) === form.eventId,
    )
    .map((tier) => tier.price);
  const cheapest = prices.length ? Math.min(...prices) : null;
  const codeLocked = Boolean(editing && editing.used > 0);

  const setField = (name) => (change) => {
    const { value } = change.target;
    setForm((current) => ({
      ...current,
      [name]:
        name === "code" ? value.toUpperCase().replace(/[^A-Z0-9]/g, "") : value,
    }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = async () => {
    const found = validatePromo(form, { promos, tiers, editing });
    if (Object.keys(found).length) {
      setErrors(found);
      setSubmitError("Please fix the highlighted fields");
      return;
    }

    setSaving(true);
    setSubmitError("");
    try {
      const payload = toPromoPayload(form);
      const saved = editing
        ? await ticketService.updatePromo(editing.id, payload)
        : await ticketService.createPromo(payload);
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
      size="md"
      title={editing ? "Edit promo code" : "Create promo code"}
      subtitle="Customers type this code at checkout to get a discount"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={handleSubmit}>
            {editing ? "Save changes" : "Create code"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <TextField
          label="Coupon code"
          required
          placeholder="LOOPVIP20"
          maxLength={15}
          disabled={codeLocked}
          value={form.code}
          onChange={setField("code")}
          error={errors.code}
          hint={
            codeLocked
              ? "Locked because customers have used it"
              : "Letters and numbers only, 4 to 15 characters"
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Discount type"
            options={DISCOUNT_TYPES}
            value={form.discountType}
            onChange={setField("discountType")}
          />
          <TextField
            label={
              form.discountType === "PERCENT"
                ? "Discount percentage"
                : "Discount amount"
            }
            type="number"
            min="1"
            required
            prefix={form.discountType === "FLAT" ? "₹" : undefined}
            placeholder={form.discountType === "PERCENT" ? "20" : "500"}
            value={form.value}
            onChange={setField("value")}
            error={errors.value}
            hint={
              form.discountType === "PERCENT"
                ? "Between 1 and 90 percent"
                : cheapest
                  ? `Cheapest ticket here is ${rupees(cheapest)}`
                  : "Taken off every ticket"
            }
          />
        </div>

        <SelectField
          label="Works for"
          options={[
            { value: "all", label: "All events" },
            ...events
              .filter((event) => event.status !== "WRAP")
              .map((event) => ({
                value: String(event.id),
                label: event.title,
              })),
          ]}
          value={form.eventId}
          onChange={setField("eventId")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Maximum uses"
            type="number"
            min="1"
            required
            placeholder="500"
            value={form.maxUses}
            onChange={setField("maxUses")}
            error={errors.maxUses}
            hint="The code stops working after this many uses"
          />
          <TextField
            label="Expiry date"
            type="date"
            required
            min={editing ? undefined : todayIso()}
            value={form.expiresOn}
            onChange={setField("expiresOn")}
            error={errors.expiresOn}
          />
        </div>

        {editing && (
          <p className="text-xs text-muted">
            {editing.used.toLocaleString("en-IN")} uses are counted so far.
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

export default PromoFormModal;
