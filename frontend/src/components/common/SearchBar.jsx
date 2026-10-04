import React, { useRef } from "react";
import Icon from "./Icon";

export function SearchBar({
  placeholder = "Search students, skills, teams...",
  value,
  onChange,
  onSubmit,
  className = "",
  showShortcut = true,
}) {
  const inputRef = useRef(null);

  const handleShortcutClick = () => {
    inputRef.current?.focus();
  };

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(e);
      }}
      className={`w-full ${className}`.trim()}
    >
      <label className="search-bar">
        <Icon name="search" size={21} />
        <input
          ref={inputRef}
          aria-label="Search"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {showShortcut && (
          <span
            onClick={handleShortcutClick}
            className="search-shortcut cursor-pointer hover:bg-slate-200 transition-colors"
            title="Press Cmd+K or click to search"
          >
            ⌘ K
          </span>
        )}
      </label>
    </form>
  );
}

export default SearchBar;
