
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Plus,
  Building2,
  CheckCircle,
  Clock,
  IndianRupee,
  RefreshCw,
  X,
} from "lucide-react";

import LocationTable from "../../components/shooting-locations/LocationTable";
import LocationModal from "../../components/shooting-locations/LocationModal";
import LocationFilters from "../../components/shooting-locations/LocationFilters";
import {
  locationsApi,
  fetchProjectNames,
  toFormValues,
} from "../../services/crmApi";

import "./ShootingLocationsPage.css";

function ShootingLocationsPage() {
  const [locations, setLocations] = useState([]);
  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [viewingLocation, setViewingLocation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saveError, setSaveError] = useState("");

  // Fetch locations from backend
  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const list = await locationsApi.list();
      setLocations(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "Unable to load locations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Project names for the modal dropdown
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

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        [
          location.name,
          location.address,
          location.city,
          location.state,
          location.contactPerson,
          location.project,
        ].some((value) =>
          String(value || "").toLowerCase().includes(searchText)
        );

      const matchesType =
        type === "All" || location.type === type;

      const matchesStatus =
        status === "All" || location.status === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [locations, search, type, status]);

  const totalLocations = locations.length;

  const approvedLocations = locations.filter(
    (location) => location.status === "Approved"
  ).length;

  const pendingLocations = locations.filter(
    (location) => location.status === "Pending"
  ).length;

  const totalRentalCost = locations.reduce(
    (total, location) =>
      total + (Number(location.rentalCost) || 0),
    0
  );

  const openAddModal = () => {
    setEditingLocation(null);
    setViewingLocation(null);
    setSaveError("");
    setIsModalOpen(true);
  };

  const openEditModal = (location) => {
    setEditingLocation(toFormValues(location));
    setViewingLocation(null);
    setSaveError("");
    setIsModalOpen(true);
  };

  const openViewModal = (location) => {
    setViewingLocation(toFormValues(location));
    setEditingLocation(null);
    setSaveError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingLocation(null);
    setViewingLocation(null);
    setSaveError("");
  };

  const handleSaveLocation = async (formData) => {
    const payload = {
      ...formData,
      project: formData.project || "Not Assigned",
    };

    setSaving(true);
    setSaveError("");

    try {
      if (editingLocation) {
        const saved = await locationsApi.update(
          editingLocation.id,
          payload
        );

        setLocations((prev) =>
          prev.map((location) =>
            location.id === saved.id ? saved : location
          )
        );
      } else {
        const saved = await locationsApi.create(payload);

        setLocations((prev) => [saved, ...prev]);
      }

      setIsModalOpen(false);
      setEditingLocation(null);
      setViewingLocation(null);
    } catch (err) {
      setSaveError(err.message || "Unable to save location.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLocation = async (location) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${location.name}"?`
    );

    if (!confirmed) return;

    setActionError("");

    try {
      await locationsApi.remove(location.id);

      setLocations((prev) =>
        prev.filter((item) => item.id !== location.id)
      );
    } catch (err) {
      setActionError(err.message || "Unable to delete location.");
    }
  };

  return (
    <div className="shooting-locations-page">
      <div className="shooting-locations-header">
        <div>
          <span className="shooting-locations-eyebrow">
            PRODUCTION MANAGEMENT
          </span>

          <h1>Shooting Locations</h1>

          <p>
            Manage filming locations, rental costs and approval status.
          </p>
        </div>

        <button
          type="button"
          className="add-location-btn"
          onClick={openAddModal}
          disabled={loading || saving}
        >
          <Plus size={18} />
          Add Location
        </button>
      </div>

      {error && (
        <div className="locations-api-error" role="alert">
          <span>{error}</span>

          <button
            type="button"
            onClick={fetchLocations}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      {actionError && (
        <div className="locations-api-error" role="alert">
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

      <div className="location-stats-grid">
        <div className="location-stat-card">
          <div className="location-stat-icon gold">
            <MapPin size={20} />
          </div>

          <div>
            <span>Total Locations</span>
            <h3>{loading ? "..." : totalLocations}</h3>
          </div>
        </div>

        <div className="location-stat-card">
          <div className="location-stat-icon green">
            <CheckCircle size={20} />
          </div>

          <div>
            <span>Approved Locations</span>
            <h3>{loading ? "..." : approvedLocations}</h3>
          </div>
        </div>

        <div className="location-stat-card">
          <div className="location-stat-icon yellow">
            <Clock size={20} />
          </div>

          <div>
            <span>Pending Approval</span>
            <h3>{loading ? "..." : pendingLocations}</h3>
          </div>
        </div>

        <div className="location-stat-card">
          <div className="location-stat-icon silver">
            <IndianRupee size={20} />
          </div>

          <div>
            <span>Total Rental Cost</span>
            <h3>
              {loading
                ? "..."
                : new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(totalRentalCost)}
            </h3>
          </div>
        </div>
      </div>

      <div className="shooting-locations-content">
        <div className="location-content-heading">
          <div>
            <h2>Location Directory</h2>
            <p>
              {loading
                ? "Loading locations..."
                : `${filteredLocations.length} of ${totalLocations} locations`}
            </p>
          </div>
        </div>

        <LocationFilters
          search={search}
          setSearch={setSearch}
          type={type}
          setType={setType}
          status={status}
          setStatus={setStatus}
        />

        {loading ? (
          <div className="locations-loading">
            <RefreshCw size={22} className="locations-loading-icon" />
            <p>Loading locations...</p>
          </div>
        ) : (
          <LocationTable
            locations={filteredLocations}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={handleDeleteLocation}
          />
        )}
      </div>

      <LocationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSaveLocation}
        editingLocation={editingLocation}
        viewingLocation={viewingLocation}
        projects={projects}
        saving={saving}
        saveError={saveError}
      />
    </div>
  );
}

export default ShootingLocationsPage;
