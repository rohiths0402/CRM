import React from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Building2,
} from "lucide-react";

import "./ProductionHouseTable.css";

function ProductionHouseTable({
  houses,
  onView,
  onEdit,
  onDelete,
}) {
  if (houses.length === 0) {
    return (
      <div className="empty-state">
        <Building2 size={35} />

        <h3>No Production Houses Found</h3>

        <p>
          Try changing your search or add a new production house.
        </p>
      </div>
    );
  }

  return (
    <div className="production-table-wrapper">
      <table className="production-table">
        <thead>
          <tr>
            <th scope="col">Production House</th>
            <th scope="col">Contact Person</th>
            <th scope="col">Email</th>
            <th scope="col">Location</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>

        <tbody>
          {houses.map((house) => (
            <tr key={house.id}>
              <td>
                <div className="company-cell">
                  <div className="company-icon">
                    <Building2 size={19} />
                  </div>

                  <div>
                    <strong>{house.companyName}</strong>
                    <span>
                      {house.website || "No website"}
                    </span>
                  </div>
                </div>
              </td>

              <td>{house.contactPerson}</td>

              <td>{house.email}</td>

              <td>{house.location}</td>

              <td>
                <span
                  className={`status-badge ${house.status.toLowerCase()}`}
                >
                  {house.status}
                </span>
              </td>

              <td>
                <div className="table-actions">
                  <button
                    type="button"
                    title="View production house"
                    aria-label={`View ${house.companyName}`}
                    onClick={() => onView(house)}
                  >
                    <Eye size={17} />
                  </button>

                  <button
                    type="button"
                    title="Edit production house"
                    aria-label={`Edit ${house.companyName}`}
                    onClick={() => onEdit(house)}
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    className="delete-action"
                    title="Delete production house"
                    aria-label={`Delete ${house.companyName}`}
                    onClick={() => onDelete(house.id)}
                  >
                    <Trash2 size={17} />
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

export default ProductionHouseTable;