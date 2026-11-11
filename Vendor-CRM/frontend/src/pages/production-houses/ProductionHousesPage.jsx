import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Building2, RefreshCw } from "lucide-react";

import ProductionHouseTable from "../../components/production-houses/ProductionHouseTable";
import ProductionHouseModal from "../../components/production-houses/ProductionHouseModal";
import ProductionHouseFilters from "../../components/production-houses/ProductionHouseFilters";
import productionHouseService from "../../services/productionHouseService";

import "./ProductionHousesPage.css";

function getHouseList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.productionHouses)) return response.productionHouses;
  if (Array.isArray(response?.data?.productionHouses)) {
    return response.data.productionHouses;
  }
  if (Array.isArray(response?.items)) return response.items;

  return [];
}

function normalizeHouse(house) {
  return {
    ...house,
    id: house.id ?? house._id,
    companyName: house.companyName ?? house.name ?? "",
    contactPerson: house.contactPerson ?? "",
    email: house.email ?? "",
    phone: house.phone ?? "",
    location: house.location ?? "",
    website: house.website ?? "",
    status: house.status ?? "Active",
    description: house.description ?? "",
  };
}

function ProductionHousesPage() {
  const [houses, setHouses] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState(null);
  const [viewingHouse, setViewingHouse] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch production houses from backend
  const fetchProductionHouses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await productionHouseService.getAll();
      const list = getHouseList(response);

      setHouses(list.map(normalizeHouse));
    } catch (err) {
      setError(err.message || "Unable to load production houses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductionHouses();
  }, [fetchProductionHouses]);

  // Search and status filtering
  const filteredHouses = useMemo(() => {
    const query = search.toLowerCase().trim();

    return houses.filter((house) => {
      const matchesSearch = [
        house.companyName,
        house.contactPerson,
        house.email,
        house.location,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesStatus =
        status === "All" ||
        String(house.status).toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [houses, search, status]);

  const openAddModal = () => {
    setEditingHouse(null);
    setViewingHouse(null);
    setIsModalOpen(true);
  };

  const openEditModal = (house) => {
    setEditingHouse(house);
    setViewingHouse(null);
    setIsModalOpen(true);
  };

  const openViewModal = (house) => {
    setViewingHouse(house);
    setEditingHouse(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingHouse(null);
    setViewingHouse(null);
  };

  // Create or update production house
  const handleSave = async (formData) => {
    setSaving(true);
    setError("");

    try {
      if (editingHouse) {
        await productionHouseService.update(
          editingHouse.id,
          formData
        );
      } else {
        await productionHouseService.create(formData);
      }

      closeModal();
      await fetchProductionHouses();
    } catch (err) {
      setError(err.message || "Unable to save production house.");
    } finally {
      setSaving(false);
    }
  };

  // Delete production house
  const handleDelete = async (id) => {
    const house = houses.find((item) => item.id === id);

    if (!house) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${house.companyName}"?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await productionHouseService.delete(id);
      await fetchProductionHouses();
    } catch (err) {
      setError(err.message || "Unable to delete production house.");
    }
  };

  return (
    <div className="production-houses-page">
      <div className="production-page-heading">
        <div>
          <span className="production-eyebrow">
            PRODUCTION MANAGEMENT
          </span>

          <h1>Production Houses</h1>

          <p>Manage and monitor your production house partners.</p>
        </div>

        <button
          className="add-production-btn"
          onClick={openAddModal}
          disabled={loading || saving}
        >
          <Plus size={17} />
          Add Production House
        </button>
      </div>

      <div className="production-overview-card">
        <div className="overview-icon">
          <Building2 size={23} />
        </div>

        <div>
          <span>Total Production Houses</span>
          <h2>{loading ? "..." : houses.length}</h2>
        </div>
      </div>

      {error && (
        <div className="production-api-error" role="alert">
          <span>{error}</span>

          <button
            type="button"
            onClick={fetchProductionHouses}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      <div className="production-list-section">
        <div className="production-list-heading">
          <h2>All Production Houses</h2>

          <p>
            {loading
              ? "Loading production houses..."
              : `${filteredHouses.length} production houses found`}
          </p>
        </div>

        <ProductionHouseFilters
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
        />

        {loading ? (
          <div className="production-loading">
            <RefreshCw size={22} className="loading-icon" />
            <p>Loading production houses...</p>
          </div>
        ) : (
          <ProductionHouseTable
            houses={filteredHouses}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        )}

        <div className="production-pagination">
          <span>
            Showing {filteredHouses.length} of {houses.length} production houses
          </span>
        </div>
      </div>

      <ProductionHouseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSave}
        editingHouse={editingHouse}
        viewingHouse={viewingHouse}
      />

      {saving && (
        <div className="production-saving-indicator">
          Saving production house...
        </div>
      )}
    </div>
  );
}

export default ProductionHousesPage;
