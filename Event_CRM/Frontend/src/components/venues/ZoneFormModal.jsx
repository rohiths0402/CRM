import { useEffect, useState } from "react";
import Button from "../common/Button";
import Modal from "../common/Modal";
import { SelectField, TextField } from "../common/FormControls";
import { venueService } from "../../api/services/venueService";
import { SAFETY_STATUS, ZONE_KINDS } from "../../constants/venueOptions";
import { formatNumber } from "../../utils/format";
import {
  emptyZoneForm,
  seatsLeft,
  toZoneFormValues,
  toZonePayload,
  validateZone,
} from "./zoneFormHelpers";

const kindOptions = ZONE_KINDS.map((kind) => ({ value: kind, label: kind }));
const safetyOptions = Object.entries(SAFETY_STATUS).map(
  ([value, { label }]) => ({ value, label }),
);

const ZoneFormModal = ({ open, onClose, venue, editing, onSaved }) => {
  const [form, setForm] = useState(emptyZoneForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError("");
    setForm(editing ? toZoneFormValues(editing) : emptyZoneForm);
  }, [open, editing]);

  if (!venue) return null;

  const room = seatsLeft(venue, editing?.id);

  const setField = (name) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = async () => {
    const found = validateZone(form, { venue, editing });
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setSaving(true);
    setSubmitError("");
    try {
      const payload = toZonePayload(form);
      const updated = editing
        ? await venueService.updateZone(venue.id, editing.id, payload)
        : await venueService.addZone(venue.id, payload);
      onSaved(updated, editing ? "edit" : "create");
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
      title={editing ? "Edit seating zone" : "Add seating zone"}
      subtitle={`${venue.name} · ${formatNumber(room)} seats left to allocate`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={handleSubmit}>
            {editing ? "Save changes" : "Add zone"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Zone name"
            required
            placeholder="Gold Fan Pit"
            value={form.name}
            onChange={setField("name")}
            error={errors.name}
          />
          <SelectField
            label="Zone type"
            required
            placeholder="Select type"
            options={kindOptions}
            value={form.kind}
            onChange={setField("kind")}
            error={errors.kind}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Allocated capacity"
            type="number"
            min="1"
            required
            placeholder="5000"
            value={form.capacity}
            onChange={setField("capacity")}
            error={errors.capacity}
            hint={`Up to ${formatNumber(room)} seats`}
          />
          <TextField
            label="Fire exits"
            type="number"
            min="1"
            required
            placeholder="4"
            value={form.fireExits}
            onChange={setField("fireExits")}
            error={errors.fireExits}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Safety clearance"
            options={safetyOptions}
            value={form.safetyStatus}
            onChange={setField("safetyStatus")}
          />
          <TextField
            label="Last inspection"
            type="date"
            max={new Date().toLocaleDateString("en-CA")}
            value={form.lastInspection}
            onChange={setField("lastInspection")}
            error={errors.lastInspection}
          />
        </div>

        {editing && (
          <p className="text-xs text-muted">
            {formatNumber(editing.sold)} tickets are sold in this zone, so the
            capacity cannot go below that.
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

export default ZoneFormModal;
