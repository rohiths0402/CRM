import { useEffect, useState } from "react";
import Button from "../common/Button";
import CheckboxField from "../common/CheckboxField";
import Modal from "../common/Modal";
import { SelectField, TextField } from "../common/FormControls";
import { venueService } from "../../api/services/venueService";
import { STATE_LIST } from "../../constants/indiaStates";
import { VENUE_TYPES } from "../../constants/venueOptions";
import {
  emptyVenueForm,
  toVenueFormValues,
  toVenuePayload,
  validateVenue,
} from "./venueFormHelpers";

const stateOptions = STATE_LIST.map((state) => ({
  value: state.slug,
  label: state.name,
}));
const typeOptions = VENUE_TYPES.map((type) => ({ value: type, label: type }));

const SectionTitle = ({ children }) => (
  <p className="border-b border-line pb-2 text-sm font-semibold">{children}</p>
);

const VenueFormModal = ({
  open,
  onClose,
  editing,
  venues,
  events,
  onSaved,
}) => {
  const [form, setForm] = useState(emptyVenueForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError("");
    setForm(editing ? toVenueFormValues(editing) : emptyVenueForm);
  }, [open, editing]);

  const setField = (name) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError("");
  };

  const setCheck = (name) => (event) => {
    const { checked } = event.target;
    setForm((current) => ({ ...current, [name]: checked }));
  };

  const handleSubmit = async () => {
    const found = validateVenue(form, { venues, events, editing });
    if (Object.keys(found).length) {
      setErrors(found);
      setSubmitError("Please fix the highlighted fields");
      return;
    }

    setSaving(true);
    setSubmitError("");
    try {
      const payload = toVenuePayload(form);
      const saved = editing
        ? await venueService.update(editing.id, payload)
        : await venueService.create(payload);
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
      title={editing ? "Edit venue" : "Add new venue"}
      subtitle="Venue details are used by Events Master when an event is created"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={handleSubmit}>
            {editing ? "Save changes" : "Add venue"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <section className="space-y-4">
          <SectionTitle>Basic details</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Venue name"
              required
              placeholder="YMCA Grounds, Nandanam"
              value={form.name}
              onChange={setField("name")}
              error={errors.name}
            />
            <SelectField
              label="Venue type"
              required
              placeholder="Select type"
              options={typeOptions}
              value={form.type}
              onChange={setField("type")}
              error={errors.type}
            />
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>Location</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="State"
              required
              placeholder="Select state"
              options={stateOptions}
              value={form.stateSlug}
              onChange={setField("stateSlug")}
              error={errors.stateSlug}
            />
            <TextField
              label="City"
              required
              placeholder="Chennai"
              value={form.city}
              onChange={setField("city")}
              error={errors.city}
            />
          </div>
          <TextField
            label="Full address"
            required
            placeholder="Street, area, city, state and pincode"
            value={form.address}
            onChange={setField("address")}
            error={errors.address}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Latitude"
              type="number"
              step="any"
              required
              placeholder="13.0305"
              value={form.lat}
              onChange={setField("lat")}
              error={errors.lat}
              hint="In Google Maps, right click the place and copy the first number"
            />
            <TextField
              label="Longitude"
              type="number"
              step="any"
              required
              placeholder="80.2418"
              value={form.lng}
              onChange={setField("lng")}
              error={errors.lng}
              hint="The second number from the same place"
            />
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>Capacity and cost</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Total licensed capacity"
              type="number"
              min="1"
              required
              placeholder="15000"
              value={form.capacity}
              onChange={setField("capacity")}
              error={errors.capacity}
              hint="The maximum people the licence allows"
            />
            <TextField
              label="Base rent per day"
              type="number"
              min="0"
              required
              prefix="₹"
              placeholder="1200000"
              value={form.baseRent}
              onChange={setField("baseRent")}
              error={errors.baseRent}
            />
            <TextField
              label="Parking stalls"
              type="number"
              min="0"
              required
              placeholder="800"
              value={form.parkingStalls}
              onChange={setField("parkingStalls")}
              error={errors.parkingStalls}
            />
            <TextField
              label="Green rooms"
              type="number"
              min="0"
              required
              placeholder="6"
              value={form.greenRooms}
              onChange={setField("greenRooms")}
              error={errors.greenRooms}
              hint="Backstage rooms for artists"
            />
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>Facilities and safety</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <CheckboxField
              label="Power backup"
              hint="Generator or UPS for the full show"
              checked={form.powerBackup}
              onChange={setCheck("powerBackup")}
            />
            <CheckboxField
              label="Wheelchair access"
              hint="Ramps and accessible entry"
              checked={form.wheelchairAccess}
              onChange={setCheck("wheelchairAccess")}
            />
          </div>
          <TextField
            label="Fire NOC valid till"
            type="date"
            required
            value={form.fireNocValidTill}
            onChange={setField("fireNocValidTill")}
            error={errors.fireNocValidTill}
            hint="You get a warning when it is about to expire"
          />
        </section>

        <section className="space-y-4">
          <SectionTitle>Venue contact</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Contact person"
              required
              placeholder="S. Ramesh"
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

export default VenueFormModal;
