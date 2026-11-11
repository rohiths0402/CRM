import React from "react";
import { Search, Filter } from "lucide-react";
import "./CastCrewFilters.css";

function CastCrewFilters({
  search,
  setSearch,
  role,
  setRole,
  status,
  setStatus,
}) {
  return (
    <div className="cast-filters">
      <div className="cast-search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="cast-filter-select">
        <Filter size={17} />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="All">All Roles</option>
          <option value="Actor">Actor</option>
          <option value="Director">Director</option>
          <option value="Cinematographer">Cinematographer</option>
          <option value="Editor">Editor</option>
          <option value="Producer">Producer</option>
          <option value="Technician">Technician</option>
          <option value="Writer">Writer</option>
        </select>
      </div>

      <div className="cast-filter-select">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="On Project">On Project</option>
          <option value="Unavailable">Unavailable</option>
        </select>
      </div>
    </div>
  );
}

export default CastCrewFilters;
