import { useEffect, useState } from "react";
import Button from "../common/Button";
import CheckboxField from "../common/CheckboxField";
import Modal from "../common/Modal";
import { TextAreaField, TextField } from "../common/FormControls";
import { lineupService } from "../../api/services/lineupService";
import {
  emptyRiderForm,
  toRiderFormValues,
  validateRider,
} from "./lineupHelpers";

const RiderFormModal = ({ open, onClose, slot, onSaved }) => {
  const [form, setForm] = useState(emptyRiderForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open || !slot) return;
    setErrors({});
    setSubmitError("");
    setForm(toRiderFormValues(slot));
  }, [open, slot]);

  if (!slot) return null;

  const setField = (name) => (change) => {
    const { value } = change.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = async () => {
    const found = validateRider(form, slot);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setSaving(true);
    setSubmitError("");
    try {
      const updated = await lineupService.updateRider(slot.id, {
        managerName: form.managerName.trim(),
        managerPhone: form.managerPhone.trim(),
        managerEmail: form.managerEmail.trim(),
        dietaryNotes: form.dietaryNotes.trim(),
        soundRigNotes: form.soundRigNotes.trim(),
        securityNotes: form.securityNotes.trim(),
        escortRequired: form.escortRequired,
      });
      onSaved(updated);
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
      title="Edit rider and hospitality"
      subtitle={slot.artistName}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={handleSubmit}>
            Save rider
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Manager name"
            value={form.managerName}
            onChange={setField("managerName")}
            error={errors.managerName}
          />
          <TextField
            label="Manager mobile"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={form.managerPhone}
            onChange={setField("managerPhone")}
            error={errors.managerPhone}
          />
        </div>
        <TextField
          label="Manager email"
          type="email"
          placeholder="manager@artist.com"
          value={form.managerEmail}
          onChange={setField("managerEmail")}
          error={errors.managerEmail}
        />
        <TextAreaField
          label="Dietary requirements"
          placeholder="Sattvic meals for 12, warm water only"
          value={form.dietaryNotes}
          onChange={setField("dietaryNotes")}
          error={errors.dietaryNotes}
          hint={`${form.dietaryNotes.length} / 300`}
        />
        <TextAreaField
          label="Sound rig and backline"
          placeholder="Full band rig, 24 channel monitor mix and in-ear monitors"
          value={form.soundRigNotes}
          onChange={setField("soundRigNotes")}
          error={errors.soundRigNotes}
          hint={`${form.soundRigNotes.length} / 300`}
        />
        <TextAreaField
          label="Security"
          placeholder="Six personal security staff and VIP gate access"
          value={form.securityNotes}
          onChange={setField("securityNotes")}
          error={errors.securityNotes}
          hint={`${form.securityNotes.length} / 300`}
        />
        <CheckboxField
          label="Security escort needed"
          hint="The security team plans an escort from arrival to the stage"
          checked={form.escortRequired}
          onChange={(change) =>
            setForm((current) => ({
              ...current,
              escortRequired: change.target.checked,
            }))
          }
        />

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

export default RiderFormModal;
