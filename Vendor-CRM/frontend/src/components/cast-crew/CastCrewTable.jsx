
import React from "react";
import { Eye, Pencil, Trash2, Users } from "lucide-react";
import "./CastCrewTable.css";

function CastCrewTable({ members, onView, onEdit, onDelete }) {
  if (!members.length) {
    return (
      <div className="cast-table-empty">
        <Users size={36} />
        <h3>No members found</h3>
        <p>Try changing your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="cast-table-wrapper">
      <table className="cast-crew-table">
        <thead>
          <tr>
            <th>MEMBER</th>
            <th>ROLE</th>
            <th>EXPERIENCE</th>
            <th>LOCATION</th>
            <th>PROJECT</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>
                <div className="cast-member-info">
                  <div className="cast-member-avatar">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{member.name}</strong>
                    <span>{member.email}</span>
                    <span>{member.phone}</span>
                  </div>
                </div>
              </td>

              <td>{member.role}</td>
              <td>{member.experience}</td>
              <td>{member.location}</td>
              <td>{member.project}</td>

              <td>
                <span
                  className={`cast-status ${member.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {member.status}
                </span>
              </td>

              <td>
                <div className="cast-table-actions">
                  <button title="View" onClick={() => onView(member)}>
                    <Eye size={16} />
                  </button>
                  <button title="Edit" onClick={() => onEdit(member)}>
                    <Pencil size={16} />
                  </button>
                  <button
                    className="delete-action"
                    title="Delete"
                    onClick={() => onDelete(member)}
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

export default CastCrewTable;
