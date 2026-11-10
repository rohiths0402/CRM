import { useEffect, useState } from "react";
import Button from "../common/Button";
import Modal from "../common/Modal";
import { TextField } from "../common/FormControls";
import { sponsorService } from "../../api/services/sponsorService";
import { formatDate } from "../../utils/format";
import {
  emptyDeliverableForm,
  toDeliverableFormValues,
  validateDeliverable,
} from "./sponsorHelpers";

const DeliverableFormModal = ({ open, onClose, sponsor, editing, onSaved }) => {
  const [form, setForm] = useState(emptyDeliverableForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError("");
    setForm(editing ? toDeliverableFormValues(editing) : emptyDeliverableForm);
  }, [open, editing]);

  if (!sponsor) return null;

  const setField = (name) => (change) => {
    const { value } = change.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = async () => {
    const found = validateDeliverable(form, { sponsor, editing });
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setSaving(true);
    setSubmitError("");
    try {
      const payload = { text: form.text.trim(), dueDate: form.dueDate };
      const updated = editing
        ? await sponsorService.updateDeliverable(
            sponsor.id,
            editing.id,
            payload,
          )
        : await sponsorService.addDeliverable(sponsor.id, payload);
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
      title={editing ? "Edit deliverable" : "Add deliverable"}
      subtitle={`${sponsor.brandName} · Event on ${formatDate(sponsor.eventDate)}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={handleSubmit}>
            {editing ? "Save changes" : "Add deliverable"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <TextField
          label="What we promised the brand"
          required
          placeholder="Logo on the main LED backdrop"
          value={form.text}
          onChange={setField("text")}
          error={errors.text}
        />
        <TextField
          label="Due date"
          type="date"
          required
          max={sponsor.eventDate}
          value={form.dueDate}
          onChange={setField("dueDate")}
          error={errors.dueDate}
          hint="Must be on or before the event date"
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

export default DeliverableFormModal;
