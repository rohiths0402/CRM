
import React from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";
import "./DeleteProjectModal.css";

function DeleteProjectModal({
  isOpen,
  onClose,
  onConfirm,
  projectName,
  deleting = false,
  error = "",
}) {
  if (!isOpen) return null;

  return (
    <div className="ott-delete-overlay" onClick={onClose}>
      <div
        className="ott-delete-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="ott-delete-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <div className="ott-delete-icon">
          <AlertTriangle size={26} />
        </div>

        <h2>Delete Project?</h2>

        <p>
          Are you sure you want to delete{" "}
          <strong>{projectName}</strong>?
          This action cannot be undone.
        </p>

        {error && (
          <div className="ott-delete-error" role="alert">
            {error}
          </div>
        )}

        <div className="ott-delete-actions">
          <button
            type="button"
            className="ott-delete-cancel"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="ott-delete-confirm"
            onClick={onConfirm}
            disabled={deleting}
          >
            <Trash2 size={16} />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteProjectModal;
