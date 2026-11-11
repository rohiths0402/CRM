
import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import "./OTTProjectFilters.css";

function OTTProjectFilters({
  search,
  setSearch,
  platform,
  setPlatform,
  status,
  setStatus,
}) {
  return (
    <div className="ott-filters">
      <div className="ott-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search projects, manager, genre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="ott-filter-select">
        <SlidersHorizontal size={17} />
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          <option value="All">All Platforms</option>
          <option value="Netflix">Netflix</option>
          <option value="Amazon Prime Video">Amazon Prime Video</option>
          <option value="Disney+ Hotstar">Disney+ Hotstar</option>
          <option value="ZEE5">ZEE5</option>
          <option value="Sony LIV">Sony LIV</option>
        </select>
      </div>

      <div className="ott-filter-select">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Planning">Planning</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>
    </div>
  );
}

export default OTTProjectFilters;
