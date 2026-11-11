
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import "./OTTProjectModal.css";

const initialForm = {
  projectName: "",
  platform: "Netflix",
  projectType: "Movie",
  genre: "",
  language: "Tamil",
  startDate: "",
  endDate: "",
  budget: "",
  projectManager: "",
  status: "Planning",
  description: "",
};

function OTTProjectModal({
  isOpen,
  onClose,
  onSubmit,
  editingProject,
  viewingProject,
  saving = false,
  submitError = "",
}) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const isViewMode = Boolean(viewingProject);

  useEffect(() => {
    if (viewingProject) {
      setFormData({ ...initialForm, ...viewingProject });
    } else if (editingProject) {
      setFormData({ ...initialForm, ...editingProject });
    } else {
      setFormData(initialForm);
    }

    setErrors({});
  }, [editingProject, viewingProject, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!String(formData.projectName).trim()) {
      newErrors.projectName = "Project name is required.";
    } else if (String(formData.projectName).trim().length < 2) {
      newErrors.projectName = "Enter at least 2 characters.";
    }

    if (!String(formData.genre).trim()) {
      newErrors.genre = "Genre is required.";
    }

    if (!String(formData.language).trim()) {
      newErrors.language = "Language is required.";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required.";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required.";
    } else if (
      formData.startDate &&
      formData.endDate < formData.startDate
    ) {
      newErrors.endDate = "End date cannot be before start date.";
    }

    if (
      formData.budget === "" ||
      Number(formData.budget) <= 0 ||
      !Number.isFinite(Number(formData.budget))
    ) {
      newErrors.budget = "Enter a valid budget greater than zero.";
    }

    if (!String(formData.projectManager).trim()) {
      newErrors.projectManager = "Project manager is required.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isViewMode || saving) return;

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    onSubmit({
      ...formData,
      projectName: String(formData.projectName).trim(),
      genre: String(formData.genre).trim(),
      language: String(formData.language).trim(),
      projectManager: String(formData.projectManager).trim(),
      budget: Number(formData.budget),
      description: String(formData.description || "").trim(),
    });
  };

  const renderFieldError = (field) =>
    errors[field] ? (
      <small className="ott-field-error">{errors[field]}</small>
    ) : null;

  return (
    <div className="ott-modal-overlay" onClick={onClose}>
      <div
        className="ott-project-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ott-modal-header">
          <div>
            <span>PROJECT MANAGEMENT</span>
            <h2>
              {isViewMode
                ? "Project Details"
                : editingProject
                  ? "Edit OTT Project"
                  : "Add OTT Project"}
            </h2>
          </div>

          <button
            type="button"
            className="ott-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ott-form-grid">
            <div className="ott-form-field full-width">
              <label>Project Name *</label>
              <input
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                disabled={isViewMode}
                className={errors.projectName ? "input-error" : ""}
                placeholder="Enter project name"
              />
              {renderFieldError("projectName")}
            </div>

            <div className="ott-form-field">
              <label>OTT Platform *</label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                disabled={isViewMode}
              >
                <option>Netflix</option>
                <option>Amazon Prime Video</option>
                <option>Disney+ Hotstar</option>
                <option>ZEE5</option>
                <option>Sony LIV</option>
                <option>Other</option>
              </select>
            </div>

            <div className="ott-form-field">
              <label>Project Type *</label>
              <select
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                disabled={isViewMode}
              >
                <option>Movie</option>
                <option>Web Series</option>
                <option>Documentary</option>
                <option>Short Film</option>
                <option>Reality Show</option>
              </select>
            </div>

            <div className="ott-form-field">
              <label>Genre *</label>
              <input
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                disabled={isViewMode}
                className={errors.genre ? "input-error" : ""}
                placeholder="Action, Drama, Thriller..."
              />
              {renderFieldError("genre")}
            </div>

            <div className="ott-form-field">
              <label>Language *</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                disabled={isViewMode}
              >
                <option>Tamil</option>
                <option>Telugu</option>
                <option>Malayalam</option>
                <option>Kannada</option>
                <option>Hindi</option>
                <option>English</option>
                <option>Other</option>
              </select>
            </div>

            <div className="ott-form-field">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                disabled={isViewMode}
                className={errors.startDate ? "input-error" : ""}
              />
              {renderFieldError("startDate")}
            </div>

            <div className="ott-form-field">
              <label>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                disabled={isViewMode}
                className={errors.endDate ? "input-error" : ""}
              />
              {renderFieldError("endDate")}
            </div>

            <div className="ott-form-field">
              <label>Budget (INR) *</label>
              <input
                type="number"
                min="1"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                disabled={isViewMode}
                className={errors.budget ? "input-error" : ""}
                placeholder="Enter budget"
              />
              {renderFieldError("budget")}
            </div>

            <div className="ott-form-field">
              <label>Project Manager *</label>
              <input
                name="projectManager"
                value={formData.projectManager}
                onChange={handleChange}
                disabled={isViewMode}
                className={errors.projectManager ? "input-error" : ""}
                placeholder="Enter manager name"
              />
              {renderFieldError("projectManager")}
            </div>

            <div className="ott-form-field">
              <label>Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isViewMode}
              >
                <option>Planning</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>On Hold</option>
              </select>
            </div>

            <div className="ott-form-field full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isViewMode}
                rows={3}
                placeholder="Enter project description"
              />
            </div>
          </div>

          {submitError && !isViewMode && (
            <div className="ott-submit-error" role="alert">
              {submitError}
            </div>
          )}

          <div className="ott-modal-footer">
            <button
              type="button"
              className="ott-cancel-btn"
              onClick={onClose}
              disabled={saving}
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>

            {!isViewMode && (
              <button
                type="submit"
                className="ott-save-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingProject
                    ? "Update Project"
                    : "Save Project"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default OTTProjectModal;
