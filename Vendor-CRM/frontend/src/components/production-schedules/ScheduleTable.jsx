
import React from "react";
import {
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import "./ScheduleTable.css";

function ScheduleTable({
  schedules = [],
  onView,
  onEdit,
  onDelete,
}) {
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="schedule-table-wrapper">
      {schedules.length > 0 ? (
        <div className="schedule-table-scroll">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Schedule</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Cast & Crew</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>
                    <div className="schedule-name-cell">
                      <div className="schedule-row-icon">
                        <CalendarDays size={18} />
                      </div>

                      <div>
                        <strong>{schedule.title}</strong>
                        <span>{schedule.project}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="schedule-info-cell">
                      <span>
                        <CalendarDays size={14} />
                        {formatDate(schedule.date)}
                      </span>
                      <span>
                        <Clock size={14} />
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="schedule-location-cell">
                      <MapPin size={15} />
                      <span>{schedule.location || "-"}</span>
                    </div>
                  </td>

                  <td>
                    <div className="schedule-crew-cell">
                      <Users size={15} />
                      <span>{schedule.crew || "-"}</span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`schedule-status status-${(
                        schedule.status || "planned"
                      ).toLowerCase()}`}
                    >
                      {schedule.status}
                    </span>
                  </td>

                  <td>
                    <div className="schedule-action-buttons">
                      <button
                        type="button"
                        className="schedule-action view"
                        title="View schedule"
                        onClick={() => onView?.(schedule)}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        className="schedule-action edit"
                        title="Edit schedule"
                        onClick={() => onEdit?.(schedule)}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="schedule-action delete"
                        title="Delete schedule"
                        onClick={() => onDelete?.(schedule)}
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
      ) : (
        <div className="schedule-table-empty">
          <CalendarDays size={36} />
          <h3>No schedules found</h3>
          <p>Try changing your filters or create a new production schedule.</p>
        </div>
      )}
    </div>
  );
}

export default ScheduleTable;
