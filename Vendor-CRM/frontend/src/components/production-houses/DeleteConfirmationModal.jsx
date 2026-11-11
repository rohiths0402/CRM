import React from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";

function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  companyName,
}) {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div
        className="delete-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="delete-modal-close"
          onClick={onClose}
          type="button"
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <div className="delete-warning-icon">
          <AlertTriangle size={26} />
        </div>

        <h2>Delete Production House?</h2>

        <p>
          Are you sure you want to delete{" "}
          <strong>{companyName}</strong>?
          This action cannot be undone.
        </p>

        <div className="delete-modal-actions">
          <button
            type="button"
            className="delete-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="delete-confirm-btn"
            onClick={onConfirm}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;