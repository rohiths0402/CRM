import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  status: "Active",
  description: "",
};

function ProductionHouseModal({
  isOpen,
  onClose,
  onSubmit,
  editingHouse,
  viewingHouse,
}) {
  const [form, setForm] = useState(initialForm);

  const isViewMode = Boolean(viewingHouse);
  const isEditing = Boolean(editingHouse);

  useEffect(() => {
    if (viewingHouse) {
      setForm({ ...initialForm, ...viewingHouse });
    } else if (editingHouse) {
      setForm({ ...initialForm, ...editingHouse });
    } else {
      setForm(initialForm);
    }
  }, [editingHouse, viewingHouse, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div
      className="production-modal-overlay"
      onClick={onClose}
    >
      <div
        className="production-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="production-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="production-modal-header">
          <div>
            <h2 id="production-modal-title">
              {isViewMode
                ? "Production House Details"
                : isEditing
                ? "Edit Production House"
                : "Add Production House"}
            </h2>

            <p>
              {isViewMode
                ? "View company information"
                : "Enter the production house information"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close production house modal"
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="production-form-grid">
            <div className="form-field">
              <label htmlFor="companyName">
                Company Name *
              </label>

              <input
                id="companyName"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                required
                disabled={isViewMode}
                placeholder="Enter company name"
              />
            </div>

            <div className="form-field">
              <label htmlFor="contactPerson">
                Contact Person *
              </label>

              <input
                id="contactPerson"
                name="contactPerson"
                value={form.contactPerson}
                onChange={handleChange}
                required
                disabled={isViewMode}
                placeholder="Enter contact person"
              />
            </div>

            <div className="form-field">
              <label htmlFor="productionEmail">
                Email *
              </label>

              <input
                id="productionEmail"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={isViewMode}
                placeholder="company@example.com"
              />
            </div>

            <div className="form-field">
              <label htmlFor="productionPhone">
                Phone *
              </label>

              <input
                id="productionPhone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                disabled={isViewMode}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-field">
              <label htmlFor="productionLocation">
                Location *
              </label>

              <input
                id="productionLocation"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                disabled={isViewMode}
                placeholder="City, State"
              />
            </div>

            <div className="form-field">
              <label htmlFor="productionWebsite">
                Website
              </label>

              <input
                id="productionWebsite"
                name="website"
                value={form.website}
                onChange={handleChange}
                disabled={isViewMode}
                placeholder="www.example.com"
              />
            </div>

            <div className="form-field">
              <label htmlFor="productionStatus">
                Status
              </label>

              <select
                id="productionStatus"
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={isViewMode}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="form-field full-width">
              <label htmlFor="productionDescription">
                Description
              </label>

              <textarea
                id="productionDescription"
                name="description"
                value={form.description}
                onChange={handleChange}
                disabled={isViewMode}
                placeholder="Enter company description..."
                rows={3}
              />
            </div>
          </div>

          <div className="production-modal-footer">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>

            {!isViewMode && (
              <button type="submit" className="save-btn">
                {isEditing
                  ? "Update Production House"
                  : "Save Production House"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductionHouseModal;