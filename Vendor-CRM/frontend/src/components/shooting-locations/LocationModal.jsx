
import React, { useEffect, useState } from "react";
import {
  X,
  MapPin,
  Building2,
  User,
  Phone,
  IndianRupee,
  Film,
  Map,
  FileText,
} from "lucide-react";
import "./LocationModal.css";

const emptyForm = {
  name: "",
  type: "Studio",
  address: "",
  city: "",
  state: "",
  mapUrl: "",
  rentalCost: "",
  project: "Not Assigned",
  contactPerson: "",
  contactPhone: "",
  status: "Pending",
  description: "",
};

function LocationModal({
  isOpen,
  onClose,
  onSubmit,
  editingLocation,
  viewingLocation,
  projects = [],
  saving = false,
  saveError = "",
}) {
  const [formData, setFormData] = useState(emptyForm);

  const isViewMode = Boolean(viewingLocation);

  useEffect(() => {
    const location = viewingLocation || editingLocation;

    if (location) {
      setFormData({
        ...emptyForm,
        ...location,
      });
    } else {
      setFormData(emptyForm);
    }
  }, [editingLocation, viewingLocation, isOpen]);

  if (!isOpen) return null;

  // "Not Assigned" first, then OTT projects; keep the record's current project selectable.
  const projectOptions = [
    "Not Assigned",
    ...projects.filter((name) => name !== "Not Assigned"),
  ];

  if (formData.project && !projectOptions.includes(formData.project)) {
    projectOptions.push(formData.project);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanedData = {
      ...formData,
      project: formData.project || "Not Assigned",
      name: formData.name.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      rentalCost: Number(formData.rentalCost) || 0,
      contactPerson: formData.contactPerson.trim(),
      contactPhone: formData.contactPhone.trim(),
    };

    if (
      cleanedData.mapUrl &&
      !/^https?:\/\/.+/i.test(cleanedData.mapUrl)
    ) {
      alert("Please enter a valid Google Maps URL.");
      return;
    }

    onSubmit(cleanedData);
  };

  return (
    <div
      className="location-modal-overlay"
      onMouseDown={onClose}
    >
      <div
        className="location-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="location-modal-header">
          <div>
            <span className="location-modal-eyebrow">
              PRODUCTION MANAGEMENT
            </span>

            <h2>
              {isViewMode
                ? "Location Details"
                : editingLocation
                ? "Edit Location"
                : "Add Shooting Location"}
            </h2>

            <p>Manage shooting locations and venue information.</p>
          </div>

          <button
            type="button"
            className="location-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="location-modal-body">
            <div className="location-form-group full-width">
              <label>
                <MapPin size={15} /> Location Name *
              </label>

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter location name"
                required
                disabled={isViewMode}
              />
            </div>

            <div className="location-form-group">
              <label>
                <Building2 size={15} /> Location Type *
              </label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={isViewMode}
                required
              >
                <option>Studio</option>
                <option>Outdoor</option>
                <option>Indoor</option>
                <option>Set</option>
                <option>Private Property</option>
                <option>Public Location</option>
              </select>
            </div>

            <div className="location-form-group">
              <label>
                <Film size={15} /> OTT Project
              </label>

              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                disabled={isViewMode}
              >
                {projectOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="location-form-group full-width">
              <label>
                <MapPin size={15} /> Full Address *
              </label>

              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter street address"
                required
                disabled={isViewMode}
              />
            </div>

            <div className="location-form-group">
              <label>City *</label>

              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                required
                disabled={isViewMode}
              />
            </div>

            <div className="location-form-group">
              <label>State *</label>

              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                required
                disabled={isViewMode}
              />
            </div>

            <div className="location-form-group full-width">
              <label>
                <Map size={15} /> Google Maps Link
              </label>

              <input
                type="url"
                name="mapUrl"
                value={formData.mapUrl}
                onChange={handleChange}
                placeholder="https://maps.google.com/..."
                disabled={isViewMode}
              />

              {isViewMode && formData.mapUrl && (
                <a
                  href={formData.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="location-map-link"
                >
                  Open Location in Google Maps
                </a>
              )}
            </div>

            <div className="location-form-group">
              <label>
                <IndianRupee size={15} /> Rental Cost (₹) *
              </label>

              <input
                type="number"
                name="rentalCost"
                value={formData.rentalCost}
                onChange={handleChange}
                placeholder="Enter rental cost"
                min="0"
                required
                disabled={isViewMode}
              />
            </div>

            <div className="location-form-group">
              <label>Approval Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isViewMode}
              >
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>

            <div className="location-form-group">
              <label>
                <User size={15} /> Contact Person *
              </label>

              <input
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Enter contact person"
                required
                disabled={isViewMode}
              />
            </div>

            <div className="location-form-group">
              <label>
                <Phone size={15} /> Contact Phone *
              </label>

              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
                disabled={isViewMode}
              />
            </div>

            <div className="location-form-group full-width">
              <label>
                <FileText size={15} /> Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add location details..."
                rows={4}
                disabled={isViewMode}
              />
            </div>
          </div>

          {saveError && !isViewMode && (
            <div className="location-modal-error" role="alert">
              {saveError}
            </div>
          )}

          <div className="location-modal-footer">
            <button
              type="button"
              className="location-cancel-btn"
              onClick={onClose}
              disabled={saving}
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>

            {!isViewMode && (
              <button
                type="submit"
                className="location-save-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingLocation
                  ? "Save Changes"
                  : "Add Location"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default LocationModal;
