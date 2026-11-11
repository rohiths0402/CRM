
import React from "react";
import { Eye, Pencil, Trash2, Film } from "lucide-react";
import "./OTTProjectTable.css";

function OTTProjectTable({ projects, onView, onEdit, onDelete }) {
  if (projects.length === 0) {
    return (
      <div className="ott-empty-state">
        <Film size={36} />
        <h3>No OTT Projects Found</h3>
        <p>Try changing your search or filters, or add a new project.</p>
      </div>
    );
  }

  return (
    <div className="ott-table-wrapper">
      <table className="ott-project-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Platform</th>
            <th>Type</th>
            <th>Genre</th>
            <th>Manager</th>
            <th>Budget</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>
                <div className="ott-project-name">
                  <div className="ott-project-icon"><Film size={18} /></div>
                  <div>
                    <strong>{project.projectName}</strong>
                    <span>{project.language}</span>
                  </div>
                </div>
              </td>

              <td>{project.platform}</td>
              <td>{project.projectType}</td>
              <td>{project.genre}</td>
              <td>{project.projectManager}</td>
              <td>
                {Number(project.budget || 0).toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                })}
              </td>
              <td>
                <span
                  className={`ott-status-badge ${project.status
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {project.status}
                </span>
              </td>
              <td>
                <div className="ott-table-actions">
                  <button
                    type="button"
                    title="View"
                    onClick={() => onView(project)}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    title="Edit"
                    onClick={() => onEdit(project)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    className="ott-delete-action"
                    onClick={() => onDelete(project.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OTTProjectTable;
