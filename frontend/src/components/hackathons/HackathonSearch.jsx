import React, { useState, useEffect } from "react";
import Icon from "../common/Icon";

export function HackathonSearch({
  value = "",
  onChange,
  onDebouncedChange,
  placeholder = "Search by hackathon title, organizer, technologies, or themes...",
  className = "",
  debounceMs = 350,
}) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onDebouncedChange) {
        onDebouncedChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [internalValue, debounceMs, onDebouncedChange]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInternalValue(val);
    if (onChange) {
      onChange(e);
    }
  };

  const handleClear = () => {
    setInternalValue("");
    if (onChange) {
      onChange({ target: { value: "" } });
    }
    if (onDebouncedChange) {
      onDebouncedChange("");
    }
  };

  return (
    <div className={`search-bar ${className}`.trim()}>
      <Icon name="search" size={20} className="text-slate-400 shrink-0" />
      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Search hackathons"
        className="w-full text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="text-slate-400 hover:text-slate-600 p-1"
          aria-label="Clear search"
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
}

export default HackathonSearch;
