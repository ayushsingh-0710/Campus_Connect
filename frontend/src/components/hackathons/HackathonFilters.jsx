import React, { useState, useRef, useEffect } from "react";
import Icon from "../common/Icon";

export const CATEGORIES = [
  "Artificial Intelligence",
  "Machine Learning",
  "Web Development",
  "App Development",
  "Blockchain",
  "Cybersecurity",
  "Cloud Computing",
  "IoT",
  "Open Innovation",
];

export const MODES = ["Online", "Offline", "Hybrid"];

export const REGISTRATION_STATUSES = [
  "Open",
  "Closing Soon",
  "Closed",
  "Upcoming",
];

export const TEAM_SIZES = [
  "Individual",
  "2–4 Members",
  "2–5 Members",
  "Custom",
];

export const PRIZE_POOLS = [
  "No Prize",
  "Under ₹10,000",
  "₹10,000–₹50,000",
  "₹50,000–₹1,00,000",
  "Above ₹1,00,000",
];

export const PARTICIPATIONS = [
  "Students",
  "Open to All",
];

export const SOURCE_TYPES = [
  "Live Events",
  "Demo Data",
];

export const SORT_OPTIONS = [
  { label: "Recently Added", value: "recently-added" },
  { label: "Registration Deadline", value: "deadline" },
  { label: "Upcoming Events", value: "upcoming" },
  { label: "Highest Prize Pool", value: "prize-high" },
];

export function HackathonFilters({
  filters = {},
  onChange,
  onClear,
  sortBy = "recently-added",
  onSortChange,
  locationOptions = { counts: {}, states: [] },
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (key, value) => {
    const currentVal = filters[key];
    const nextVal = currentVal === value ? "" : value;

    const nextFilters = {
      ...filters,
      [key]: nextVal,
    };

    // Cascading reset: If country changes away from IN, reset state & city
    if (key === "country" && nextVal !== "IN") {
      nextFilters.state = "";
      nextFilters.city = "";
    }

    // Cascading reset: If state changes, reset city
    if (key === "state") {
      nextFilters.city = "";
    }

    onChange(nextFilters);
    setOpenDropdown(null);
  };

  const activeCount = Object.values(filters).filter(Boolean).length;

  const countryOptions = [
    { label: `India Only (${locationOptions?.counts?.india ?? 0})`, value: "IN" },
    { label: `International Only (${locationOptions?.counts?.international ?? 0})`, value: "international" },
    { label: `Location Not Specified (${locationOptions?.counts?.unknown ?? 0})`, value: "unknown" },
  ];

  const stateOptions = (locationOptions?.states || []).map((s) => ({
    label: `${s.name} (${s.count})`,
    value: s.name,
  }));

  const currentStateObj = (locationOptions?.states || []).find((s) => s.name === filters.state);
  const cityOptions = (currentStateObj?.cities || []).map((c) => ({
    label: `${c.name} (${c.count})`,
    value: c.name,
  }));

  const renderDropdown = (label, filterKey, options, defaultAllLabel = `All ${label}s`) => {
    const currentValue = filters[filterKey];
    const isOpen = openDropdown === filterKey;

    let displayLabel = currentValue;
    if (Array.isArray(options) && options.length > 0 && typeof options[0] === "object") {
      const match = options.find((o) => o.value === currentValue);
      if (match) {
        displayLabel = match.label.split(" (")[0]; // Clean label without count for the button text
      }
    }

    return (
      <div className="relative inline-block text-left" key={filterKey}>
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : filterKey)}
          className={`h-9 px-3.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 transition-colors ${
            currentValue
              ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <span>{currentValue ? `${label}: ${displayLabel}` : label}</span>
          <span className="text-[10px] text-slate-400">▼</span>
        </button>

        {isOpen && (
          <div className="absolute top-11 left-0 z-30 min-w-56 max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 animate-in fade-in-50 duration-100">
            <button
              type="button"
              onClick={() => handleSelect(filterKey, "")}
              className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                !currentValue ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {defaultAllLabel}
            </button>
            {options.map((opt) => {
              const optVal = typeof opt === "object" ? opt.value : opt;
              const optText = typeof opt === "object" ? opt.label : opt;
              const isSelected = currentValue === optVal;
              return (
                <button
                  key={optVal}
                  type="button"
                  onClick={() => handleSelect(filterKey, optVal)}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{optText}</span>
                  {isSelected && <span className="text-blue-600 font-bold text-xs shrink-0">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="space-y-3 my-4">
      {/* Top Filter Bar: Modes, Categories, Status, Team, Prizes, etc. */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1 uppercase tracking-wider">
            <Icon name="filter" size={14} />
            Filters
          </span>

          {renderDropdown("Mode", "mode", MODES)}
          {renderDropdown("Category", "category", CATEGORIES)}
          {renderDropdown("Status", "status", REGISTRATION_STATUSES)}
          {renderDropdown("Team Size", "teamSize", TEAM_SIZES)}
          {renderDropdown("Prize Pool", "prizePool", PRIZE_POOLS)}
          {renderDropdown("Participation", "participation", PARTICIPATIONS)}
          {renderDropdown("Source", "sourceType", SOURCE_TYPES)}

          {/* Location Dropdown */}
          {renderDropdown("Location", "country", countryOptions, "All Locations")}

          {/* Dependent State Dropdown (when India Only selected) */}
          {filters.country === "IN" && (
            renderDropdown("State", "state", stateOptions, "All Indian States")
          )}

          {/* Dependent City Dropdown (when State selected) */}
          {filters.country === "IN" && filters.state && cityOptions.length > 0 && (
            renderDropdown("City", "city", cityOptions, `All Cities in ${filters.state}`)
          )}

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-semibold text-red-600 hover:text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              Clear all ({activeCount})
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="sort-select" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location Active Hierarchy Breadcrumb indicator if India is selected */}
      {filters.country === "IN" && (
        <div className="flex items-center gap-2 text-xs bg-emerald-50/80 border border-emerald-200/90 text-emerald-800 px-3 py-1.5 rounded-xl animate-in fade-in-50 duration-200">
          <span className="font-bold inline-flex items-center gap-1">
            <span>📍</span> Active Location Filter:
          </span>
          <span>India</span>
          {filters.state && (
            <>
              <span className="text-emerald-400">›</span>
              <span className="font-semibold">{filters.state}</span>
            </>
          )}
          {filters.city && (
            <>
              <span className="text-emerald-400">›</span>
              <span className="font-bold underline">{filters.city}</span>
            </>
          )}
          <span className="ml-auto text-[11px] text-emerald-600 font-medium">
            Excluding international competitions
          </span>
        </div>
      )}
    </div>
  );
}

export default HackathonFilters;
