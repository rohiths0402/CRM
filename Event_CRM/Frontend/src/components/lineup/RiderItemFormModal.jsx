import { useEffect, useState } from "react";
import Button from "../common/Button";
import Modal from "../common/Modal";
import { SelectField, TextField } from "../common/FormControls";
import { lineupService } from "../../api/services/lineupService";
import { RIDER_CATEGORIES } from "../../constants/lineup";

const categoryOptions = Object.entries(RIDER_CATEGORIES).map(
  ([value, { label }]) => ({ value, label }),
);

const RiderItemFormModal = ({ open, onClose, slot, onSaved }) => {
  const [form, setForm] = useState({ label: "", category: "HOSPITALITY" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError("");
    setForm({ label: "", category: "HOSPITALITY" });
  }, [open]);

  if (!slot) return null;

  const setField = (name) => (change) => {
    const { value } = change.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = async () => {
    const label = form.label.trim();
    if (label.length < 5) {
      setErrors({ label: "Describe the item, at least 5 characters" });
      return;
    }
    if (
      slot.riderItems.some(
        (item) => item.label.toLowerCase() === label.toLowerCase(),
      )
    ) {
      setErrors({ label: "This item is already on the rider list" });
      return;
    }

    setSaving(true);
    setSubmitError("");
    try {
      const updated = await lineupService.addRiderItem(slot.id, {
        label,
        category: form.category,
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
      size="md"
      title="Add rider item"
      subtitle={slot.artistName}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={handleSubmit}>
            Add item
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <TextField
          label="What the artist needs"
          required
          placeholder="Fresh towels and a mirror in the green room"
          value={form.label}
          onChange={setField("label")}
          error={errors.label}
        />
        <SelectField
          label="Category"
          options={categoryOptions}
          value={form.category}
          onChange={setField("category")}
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

export default RiderItemFormModal;
