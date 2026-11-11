
import React from "react";
import {
  MapPin,
  Eye,
  Pencil,
  Trash2,
  Building2,
  Film,
} from "lucide-react";
import "./LocationTable.css";

function LocationTable({
  locations = [],
  onView,
  onEdit,
  onDelete,
}) {
  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "approved";
      case "Pending":
        return "pending";
      case "Rejected":
        return "rejected";
      default:
        return "available";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  if (locations.length === 0) {
    return (
      <div className="location-empty-state">
        <MapPin size={38} />
        <h3>No Locations Found</h3>
        <p>Add a shooting location to get started.</p>
      </div>
    );
  }

  return (
    <div className="location-table-wrapper">
      <table className="location-table">
        <thead>
          <tr>
            <th>LOCATION</th>
            <th>TYPE</th>
            <th>ADDRESS</th>
            <th>RENTAL COST</th>
            <th>PROJECT</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {locations.map((location) => (
            <tr key={location.id}>
              <td>
                <div className="location-name-cell">
                  <div className="location-icon">
                    <MapPin size={18} />
                  </div>

                  <div>
                    <h4>{location.name}</h4>
                    <span>{location.contactPerson || "No contact person"}</span>
                  </div>
                </div>
              </td>

              <td>
                <span className="location-type">
                  <Building2 size={14} />
                  {location.type}
                </span>
              </td>

              <td>
                <div className="location-address">
                  {location.address || location.city || "—"}
                </div>
              </td>

              <td className="location-cost">
                {formatCurrency(location.rentalCost)}
              </td>

              <td>
                <span className="location-project">
                  <Film size={14} />
                  {location.project || "Not Assigned"}
                </span>
              </td>

              <td>
                <span
                  className={`location-status ${getStatusClass(
                    location.status
                  )}`}
                >
                  {location.status}
                </span>
              </td>

              <td>
                <div className="location-actions">
                  <button
                    type="button"
                    title="View Location"
                    onClick={() => onView?.(location)}
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    type="button"
                    title="Edit Location"
                    onClick={() => onEdit?.(location)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    title="Delete Location"
                    className="location-delete-action"
                    onClick={() => onDelete?.(location)}
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

export default LocationTable;
