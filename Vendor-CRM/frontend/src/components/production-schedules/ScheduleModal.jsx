
import React, { useEffect, useState } from "react";
import {
  X,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  FileText,
} from "lucide-react";
import "./ScheduleModal.css";

const emptyForm = {
  title: "",
  project: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  crew: "",
  status: "Planned",
  description: "",
};

// Convert 24-hour time (HH:mm) to 12-hour clock values.
const to12Hour = (time) => {
  if (!time) {
    return { hour: "12", minute: "00", period: "AM" };
  }

  const [hours, minutes] = time.split(":");
  const hourNumber = Number(hours);

  return {
    hour: String(hourNumber % 12 || 12),
    minute: minutes,
    period: hourNumber >= 12 ? "PM" : "AM",
  };
};

// Convert 12-hour clock values to 24-hour time (HH:mm).
const to24Hour = ({ hour, minute, period }) => {
  let hours = Number(hour);

  if (period === "AM" && hours === 12) {
    hours = 0;
  } else if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  return `${String(hours).padStart(2, "0")}:${minute}`;
};

function TimePicker({ label, value, onChange, disabled }) {
  const handleChange = (field, newValue) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  return (
    <div className="schedule-form-group">
      <label>
        <Clock size={15} /> {label} *
      </label>

      <div className="schedule-time-picker">
        <select
          value={value.hour}
          onChange={(e) => handleChange("hour", e.target.value)}
          disabled={disabled}
          required
          aria-label={`${label} hour`}
        >
          {Array.from({ length: 12 }, (_, index) => {
            const hour = String(index + 1);
            return (
              <option key={hour} value={hour}>
                {hour}
              </option>
            );
          })}
        </select>

        <span className="schedule-time-separator">:</span>

        <select
          value={value.minute}
          onChange={(e) => handleChange("minute", e.target.value)}
          disabled={disabled}
          required
          aria-label={`${label} minute`}
        >
          {Array.from({ length: 60 }, (_, index) => {
            const minute = String(index).padStart(2, "0");
            return (
              <option key={minute} value={minute}>
                {minute}
              </option>
            );
          })}
        </select>

        <select
          value={value.period}
          onChange={(e) => handleChange("period", e.target.value)}
          disabled={disabled}
          aria-label={`${label} AM or PM`}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}

function ScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  editingSchedule,
  viewingSchedule,
  projects = [],
  saving = false,
  saveError = "",
}) {
  const [formData, setFormData] = useState(emptyForm);

  const [startClock, setStartClock] = useState(to12Hour(""));
  const [endClock, setEndClock] = useState(to12Hour(""));

  const isViewMode = Boolean(viewingSchedule);

  useEffect(() => {
    const schedule = viewingSchedule || editingSchedule;

    if (schedule) {
      setFormData({
        ...emptyForm,
        ...schedule,
      });

      setStartClock(to12Hour(schedule.startTime));
      setEndClock(to12Hour(schedule.endTime));
    } else {
      setFormData({
        ...emptyForm,
        project: projects[0] || "",
      });
      setStartClock(to12Hour(""));
      setEndClock(to12Hour(""));
    }
    // Projects are read when the modal opens; later loads are handled below.
  }, [editingSchedule, viewingSchedule, isOpen]);

  // Pick the first project once the project list arrives for a new schedule.
  useEffect(() => {
    if (projects.length === 0) return;

    setFormData((prev) =>
      prev.project ? prev : { ...prev, project: projects[0] }
    );
  }, [projects]);

  if (!isOpen) return null;

  // Keep the record's current project selectable even if it is not in the list.
  const projectOptions =
    formData.project && !projects.includes(formData.project)
      ? [formData.project, ...projects]
      : projects;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const startTime = to24Hour(startClock);
    const endTime = to24Hour(endClock);

    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;

    if (startTotal === endTotal) {
      alert("Start time and end time cannot be the same.");
      return;
    }

    // An end time earlier than the start time means next-day shooting.
    const submittedData = {
      ...formData,
      startTime,
      endTime,
      endsNextDay: endTotal < startTotal,
    };

    onSubmit(submittedData);
  };

  return (
    <div className="schedule-modal-overlay" onMouseDown={onClose}>
      <div
        className="schedule-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="schedule-modal-header">
          <div>
            <span className="schedule-modal-eyebrow">
              PRODUCTION MANAGEMENT
            </span>

            <h2>
              {isViewMode
                ? "Schedule Details"
                : editingSchedule
                ? "Edit Schedule"
                : "Create Schedule"}
            </h2>

            <p>Manage your production activities and shooting plans.</p>
          </div>

          <button
            type="button"
            className="schedule-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="schedule-modal-body">
            <div className="schedule-form-group full-width">
              <label>Schedule Title *</label>

              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter schedule title"
                required
                disabled={isViewMode}
              />
            </div>

            <div className="schedule-form-group">
              <label>OTT Project *</label>

              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                disabled={isViewMode}
                required
              >
                {!formData.project && (
                  <option value="" disabled>
                    {projects.length > 0
                      ? "Select project"
                      : "Add an OTT project first"}
                  </option>
                )}

                {projectOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="schedule-form-group">
              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isViewMode}
              >
                <option>Planned</option>
                <option>Confirmed</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div className="schedule-form-group">
              <label>
                <CalendarDays size={15} /> Shooting Date *
              </label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                disabled={isViewMode}
              />
            </div>

            <TimePicker
              label="Start Time"
              value={startClock}
              onChange={setStartClock}
              disabled={isViewMode}
            />

            <TimePicker
              label="End Time"
              value={endClock}
              onChange={setEndClock}
              disabled={isViewMode}
            />

            <div className="schedule-form-group full-width">
              <label>
                <MapPin size={15} /> Shooting Location *
              </label>

              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter shooting location"
                required
                disabled={isViewMode}
              />
            </div>

            <div className="schedule-form-group full-width">
              <label>
                <Users size={15} /> Cast & Crew
              </label>

              <input
                name="crew"
                value={formData.crew}
                onChange={handleChange}
                placeholder="Enter crew names separated by commas"
                disabled={isViewMode}
              />
            </div>

            <div className="schedule-form-group full-width">
              <label>
                <FileText size={15} /> Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add schedule details..."
                rows={4}
                disabled={isViewMode}
              />
            </div>
          </div>

          {saveError && !isViewMode && (
            <div className="schedule-modal-error" role="alert">
              {saveError}
            </div>
          )}

          <div className="schedule-modal-footer">
            <button
              type="button"
              className="schedule-cancel-btn"
              onClick={onClose}
              disabled={saving}
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>

            {!isViewMode && (
              <button
                type="submit"
                className="schedule-save-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingSchedule
                  ? "Save Changes"
                  : "Create Schedule"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ScheduleModal;
