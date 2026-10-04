import React from "react";

export function Select({
  label,
  options = [],
  value,
  onChange,
  className = "",
  id,
  ...rest
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <label htmlFor={selectId} className={`field ${className}`.trim()}>
      {label && <span>{label}</span>}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        className="w-full bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default Select;
