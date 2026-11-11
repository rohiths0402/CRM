import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

function ProductionHouseFilters({
  search,
  setSearch,
  status,
  setStatus,
}) {
  return (
    <div className="production-filters">
      <div className="production-search">
        <Search size={18} aria-hidden="true" />

        <input
          type="search"
          aria-label="Search production houses"
          placeholder="Search by company, contact, email or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="production-status-filter">
        <SlidersHorizontal size={17} aria-hidden="true" />

        <select
          aria-label="Filter production houses by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
}

export default ProductionHouseFilters;