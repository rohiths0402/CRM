import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import Button from "../common/Button";
import CheckboxField from "../common/CheckboxField";
import Modal from "../common/Modal";
import { SelectField, TextField } from "../common/FormControls";
import { lineupService } from "../../api/services/lineupService";
import {
  LINEUP_ROLES,
  LINEUP_STATUS,
  STAGE_SUGGESTIONS,
} from "../../constants/lineup";
import {
  CHANGEOVER,
  SOUNDCHECK_BLOCK,
  duration,
  eventWindow,
  spanOf,
} from "../../utils/lineupRules";
import {
  emptySlotForm,
  toSlotFormValues,
  toSlotPayload,
  validateSlot,
} from "./lineupHelpers";

const roleOptions = LINEUP_ROLES.map((role) => ({ value: role, label: role }));
const statusOptions = Object.entries(LINEUP_STATUS).map(
  ([value, { label }]) => ({ value, label }),
);

const SectionTitle = ({ children }) => (
  <p className="border-b border-line pb-2 text-sm font-semibold">{children}</p>
);

const SlotFormModal = ({
  open,
  onClose,
  editing,
  event,
  venue,
  slots,
  onSaved,
}) => {
  const [form, setForm] = useState(emptySlotForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError("");
    setForm(editing ? toSlotFormValues(editing) : emptySlotForm);
  }, [open, editing]);

  if (!event) return null;

  const { gates } = eventWindow(event);
  const rooms = venue?.greenRooms || 0;
  const stages = [
    ...new Set([
      ...STAGE_SUGGESTIONS,
      ...slots
        .filter((slot) => slot.eventId === event.id)
        .map((slot) => slot.stage),
    ]),
  ];

  let setLength = "";
  if (form.start && form.end) {
    const span = spanOf({ start: form.start, end: form.end }, gates);
    if (span.end > span.start) setLength = duration(span.end - span.start);
  }

  const setField = (name) => (change) => {
    const { value } = change.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = async () => {
    const found = validateSlot(form, { slots, event, venue, editing });
    if (Object.keys(found).length) {
      setErrors(found);
      setSubmitError("Please fix the highlighted fields");
      return;
    }

    setSaving(true);
    setSubmitError("");
    try {
      const payload = toSlotPayload(form, event.id, editing);
      const saved = editing
        ? await lineupService.update(editing.id, payload)
        : await lineupService.create(payload);
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
      title={editing ? "Edit lineup slot" : "Add lineup slot"}
      subtitle={event.title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={handleSubmit}>
            {editing ? "Save changes" : "Add to lineup"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <p className="flex items-start gap-2 rounded-xl bg-primary/10 px-4 py-3 text-xs text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            Gates open {event.gatesOpen}, show starts {event.showStart}, curfew{" "}
            {event.curfew}. Keep {CHANGEOVER} minutes between two acts on the
            same stage. A soundcheck takes {SOUNDCHECK_BLOCK} minutes and must
            finish before gates open. For a set after midnight, enter the early
            morning time, for example 12:10 AM.
          </span>
        </p>

        <section className="space-y-4">
          <SectionTitle>Act</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Artist or act name"
              required
              placeholder="Anirudh Ravichander"
              value={form.artistName}
              onChange={setField("artistName")}
              error={errors.artistName}
            />
            <SelectField
              label="Role"
              required
              placeholder="Select role"
              options={roleOptions}
              value={form.role}
              onChange={setField("role")}
              error={errors.role}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Stage"
              required
              list="stage-suggestions"
              placeholder="Main Arena"
              value={form.stage}
              onChange={setField("stage")}
              error={errors.stage}
            />
            <datalist id="stage-suggestions">
              {stages.map((stage) => (
                <option key={stage} value={stage} />
              ))}
            </datalist>
            <SelectField
              label="Status"
              options={statusOptions}
              value={form.status}
              onChange={setField("status")}
              hint="A cancelled act is removed from the timeline and clash checks"
            />
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>Timing</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Set starts"
              type="time"
              required
              value={form.start}
              onChange={setField("start")}
              error={errors.start}
            />
            <TextField
              label="Set ends"
              type="time"
              required
              value={form.end}
              onChange={setField("end")}
              error={errors.end}
              hint={setLength ? `Set length ${setLength}` : undefined}
            />
            <TextField
              label={
                form.role === "Headliner" ? "Soundcheck at *" : "Soundcheck at"
              }
              type="time"
              value={form.soundcheck}
              onChange={setField("soundcheck")}
              error={errors.soundcheck}
              hint={
                form.role === "Headliner"
                  ? "Required for a headliner"
                  : "Optional"
              }
            />
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>Green room and money</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              label="Green room"
              placeholder="Not assigned"
              options={Array.from({ length: rooms }, (_, index) => ({
                value: String(index + 1),
                label: `Green room ${index + 1}`,
              }))}
              value={form.greenRoom}
              onChange={setField("greenRoom")}
              error={errors.greenRoom}
              hint={
                venue ? `${venue.name} has ${rooms} green rooms` : undefined
              }
            />
            <TextField
              label="Artist fee"
              type="number"
              min="0"
              prefix="₹"
              placeholder="9000000"
              value={form.fee}
              onChange={setField("fee")}
              error={errors.fee}
            />
            <TextField
              label="Advance paid"
              type="number"
              min="0"
              prefix="₹"
              placeholder="4500000"
              value={form.advancePaid}
              onChange={setField("advancePaid")}
              error={errors.advancePaid}
            />
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>Manager</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label={
                form.status === "CONFIRMED" ? "Manager name *" : "Manager name"
              }
              placeholder="Madhan Gopal"
              value={form.managerName}
              onChange={setField("managerName")}
              error={errors.managerName}
              hint={
                form.status === "CONFIRMED"
                  ? "Required for a confirmed artist"
                  : undefined
              }
            />
            <TextField
              label={
                form.status === "CONFIRMED"
                  ? "Manager mobile *"
                  : "Manager mobile"
              }
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="9876543210"
              value={form.managerPhone}
              onChange={setField("managerPhone")}
              error={errors.managerPhone}
            />
          </div>
          {!editing && (
            <CheckboxField
              label="Add the standard rider checklist"
              hint="Dietary, sound rig, security, green room, travel and accommodation items are added"
              checked={form.addStandardRider}
              onChange={(change) =>
                setForm((current) => ({
                  ...current,
                  addStandardRider: change.target.checked,
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

export default SlotFormModal;
