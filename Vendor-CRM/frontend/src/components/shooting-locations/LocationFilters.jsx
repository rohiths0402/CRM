
import React from "react";
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";
import "./LocationFilters.css";

function LocationFilters({
  search,
  setSearch,
  type,
  setType,
  status,
  setStatus,
}) {
  const clearFilters = () => {
    setSearch("");
    setType("All");
    setStatus("All");
  };

  return (
    <div className="location-filters">
      <div className="location-search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search locations, cities, addresses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="location-filter-select">
        <SlidersHorizontal size={16} />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Filter by location type"
        >
          <option value="All">All Types</option>
          <option value="Studio">Studio</option>
          <option value="Outdoor">Outdoor</option>
          <option value="Indoor">Indoor</option>
          <option value="Set">Set</option>
          <option value="Private Property">Private Property</option>
          <option value="Public Location">Public Location</option>
        </select>
      </div>

      <div className="location-filter-select">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by approval status"
        >
          <option value="All">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <button
        type="button"
        className="location-filter-reset"
        onClick={clearFilters}
        title="Clear filters"
      >
        <RotateCcw size={15} />
        <span>Reset</span>
      </button>
    </div>
  );
}

export default LocationFilters;
