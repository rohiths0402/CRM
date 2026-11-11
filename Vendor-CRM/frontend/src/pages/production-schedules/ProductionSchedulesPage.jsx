
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Plus,
  CalendarRange,
  List,
  RefreshCw,
  X,
} from "lucide-react";

import ScheduleTable from "../../components/production-schedules/ScheduleTable";
import ScheduleFilters from "../../components/production-schedules/ScheduleFilters";
import ScheduleModal from "../../components/production-schedules/ScheduleModal";
import {
  schedulesApi,
  fetchProjectNames,
  toFormValues,
} from "../../services/crmApi";

import "./ProductionSchedulesPage.css";

// Today's date as a local YYYY-MM-DD string.
function getTodayDate() {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

function ProductionSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [project, setProject] = useState("All");

  const [view, setView] = useState("list");
  const [selectedDate, setSelectedDate] = useState(getTodayDate);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [viewingSchedule, setViewingSchedule] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saveError, setSaveError] = useState("");

  // Fetch schedules from backend
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const list = await schedulesApi.list();
      setSchedules(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "Unable to load schedules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Project names for the filter and modal dropdowns
  useEffect(() => {
    let active = true;

    fetchProjectNames()
      .then((names) => {
        if (active) setProjects(names.filter(Boolean));
      })
      .catch(() => {
        if (active) setProjects([]);
      });

    return () => {
      active = false;
    };
  }, []);

  // Projects for the filter: known projects plus any used by a schedule
  const projectOptions = useMemo(() => {
    const names = new Set(projects);

    schedules.forEach((item) => {
      if (item.project) names.add(item.project);
    });

    return Array.from(names);
  }, [projects, schedules]);

  // Search and filters
  const filteredSchedules = useMemo(() => {
    const query = search.toLowerCase().trim();

    return schedules.filter((item) => {
      const matchesSearch = [
        item.title,
        item.project,
        item.location,
        item.crew,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesStatus =
        status === "All" || item.status === status;

      const matchesProject =
        project === "All" || item.project === project;

      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [schedules, search, status, project]);

  // Dashboard statistics
  const stats = [
    {
      label: "Total Schedules",
      value: schedules.length,
      icon: CalendarDays,
    },
    {
      label: "Confirmed",
      value: schedules.filter((item) => item.status === "Confirmed").length,
      icon: CheckCircle2,
    },
    {
      label: "Planned",
      value: schedules.filter((item) => item.status === "Planned").length,
      icon: Clock,
    },
    {
      label: "Completed",
      value: schedules.filter((item) => item.status === "Completed").length,
      icon: CalendarRange,
    },
  ];

  // Modal handlers
  const openAddModal = () => {
    setEditingSchedule(null);
    setViewingSchedule(null);
    setSaveError("");
    setIsModalOpen(true);
  };

  const openEditModal = (schedule) => {
    setEditingSchedule(toFormValues(schedule));
    setViewingSchedule(null);
    setSaveError("");
    setIsModalOpen(true);
  };

  const openViewModal = (schedule) => {
    setViewingSchedule(toFormValues(schedule));
    setEditingSchedule(null);
    setSaveError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingSchedule(null);
    setViewingSchedule(null);
    setSaveError("");
  };

  // Create and update schedule
  const handleSave = async (formData) => {
    const cleanedData = {
      ...formData,
      title: (formData.title || "").trim(),
      project: (formData.project || "").trim(),
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      endsNextDay: Boolean(formData.endsNextDay),
      location: (formData.location || "").trim(),
      crew: (formData.crew || "").trim(),
      description: (formData.description || "").trim(),
    };

    if (
      !cleanedData.title ||
      !cleanedData.project ||
      !cleanedData.date ||
      !cleanedData.startTime ||
      !cleanedData.endTime ||
      !cleanedData.location
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (cleanedData.endTime === cleanedData.startTime) {
      alert("Start time and end time cannot be the same.");
      return;
    }

    // Overnight shoots (endsNextDay) may end earlier on the clock than they start.
    if (
      !cleanedData.endsNextDay &&
      cleanedData.endTime < cleanedData.startTime
    ) {
      alert("End time must be later than start time.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      if (editingSchedule) {
        const saved = await schedulesApi.update(
          editingSchedule.id,
          cleanedData
        );

        setSchedules((previous) =>
          previous.map((item) =>
            item.id === saved.id ? saved : item
          )
        );
      } else {
        const saved = await schedulesApi.create(cleanedData);

        setSchedules((previous) => [saved, ...previous]);
      }

      // Reset filters so the saved record is visible.
      setSearch("");
      setStatus("All");
      setProject("All");
      setView("list");

      setIsModalOpen(false);
      setEditingSchedule(null);
      setViewingSchedule(null);
    } catch (err) {
      setSaveError(err.message || "Unable to save schedule.");
    } finally {
      setSaving(false);
    }
  };

  // Delete schedule
  const handleDelete = async (schedule) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${schedule.title}"?`
    );

    if (!confirmed) return;

    setActionError("");

    try {
      await schedulesApi.remove(schedule.id);

      setSchedules((previous) =>
        previous.filter((item) => item.id !== schedule.id)
      );
    } catch (err) {
      setActionError(err.message || "Unable to delete schedule.");
    }
  };

  // Calendar date filtering
  const selectedDateSchedules = filteredSchedules.filter(
    (item) => item.date === selectedDate
  );

  return (
    <div className="production-schedules-page">

      {/* Page Header */}
      <div className="schedules-page-header">
        <div>
          <span className="schedules-eyebrow">
            PRODUCTION MANAGEMENT
          </span>

          <h1>Production Schedules</h1>

          <p>
            Plan and manage your shooting schedules and production activities.
          </p>
        </div>

        <button
          type="button"
          className="add-schedule-btn"
          onClick={openAddModal}
          disabled={loading || saving}
        >
          <Plus size={18} />
          Create Schedule
        </button>
      </div>

      {error && (
        <div className="schedules-api-error" role="alert">
          <span>{error}</span>

          <button
            type="button"
            onClick={fetchSchedules}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      {actionError && (
        <div className="schedules-api-error" role="alert">
          <span>{actionError}</span>

          <button
            type="button"
            onClick={() => setActionError("")}
          >
            <X size={15} />
            Dismiss
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="schedule-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="schedule-stat-card" key={stat.label}>
              <div className="schedule-stat-icon">
                <Icon size={21} />
              </div>

              <div>
                <span>{stat.label}</span>
                <h2>{loading ? "..." : stat.value}</h2>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <ScheduleFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        project={project}
        setProject={setProject}
        projects={projectOptions}
      />

      {/* Schedule Content */}
      <div className="schedules-content-panel">

        <div className="schedules-toolbar">
          <div>
            <h2>Production Calendar</h2>
            <p>Manage all your production activities.</p>
          </div>

          <div className="schedule-view-toggle">
            <button
              type="button"
              className={view === "list" ? "active" : ""}
              onClick={() => setView("list")}
            >
              <List size={16} />
              List
            </button>

            <button
              type="button"
              className={view === "calendar" ? "active" : ""}
              onClick={() => setView("calendar")}
            >
              <CalendarDays size={16} />
              Calendar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="schedules-loading">
            <RefreshCw size={22} className="schedules-loading-icon" />
            <p>Loading schedules...</p>
          </div>
        ) : view === "list" ? (
          <ScheduleTable
            schedules={filteredSchedules}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        ) : (
          <div className="schedule-calendar-view">

            <div className="calendar-date-picker">
              <label htmlFor="schedule-date">
                Select shooting date
              </label>

              <input
                id="schedule-date"
                type="date"
                value={selectedDate}
                onChange={(event) =>
                  setSelectedDate(event.target.value)
                }
              />
            </div>

            {selectedDateSchedules.length > 0 ? (
              selectedDateSchedules.map((item) => (
                <button
                  type="button"
                  className="calendar-schedule-card"
                  key={item.id}
                  onClick={() => openViewModal(item)}
                >
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.project}</span>
                  </div>

                  <div className="calendar-schedule-meta">
                    <span>
                      <Clock size={14} />
                      {item.startTime} - {item.endTime}
                    </span>

                    <span>
                      <MapPin size={14} />
                      {item.location}
                    </span>

                    <span>
                      <Users size={14} />
                      {item.crew || "No crew assigned"}
                    </span>
                  </div>

                  <span
                    className={`schedule-status status-${(
                      item.status || "planned"
                    ).toLowerCase()}`}
                  >
                    {item.status}
                  </span>
                </button>
              ))
            ) : (
              <div className="schedule-empty-state">
                <CalendarDays size={32} />
                <h3>No schedules for this date</h3>
                <p>
                  Choose another date or create a new schedule.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="schedules-results-count">
          Showing {filteredSchedules.length} of {schedules.length} schedules
        </div>
      </div>

      {/* Add / Edit / View Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSave}
        editingSchedule={editingSchedule}
        viewingSchedule={viewingSchedule}
        projects={projects}
        saving={saving}
        saveError={saveError}
      />
    </div>
  );
}

export default ProductionSchedulesPage;
