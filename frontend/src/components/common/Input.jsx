import React from "react";

export function Input({
  label,
  placeholder,
  type = "text",
  textarea = false,
  rows = 4,
  defaultValue,
  value,
  onChange,
  error,
  hint,
  className = "",
  id,
  required,
  ...rest
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <label htmlFor={inputId} className={`field ${className}`.trim()}>
      {label && (
        <span className="flex items-center justify-between">
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          {hint && <span className="text-xs text-slate-400 font-normal">{hint}</span>}
        </span>
      )}
      {textarea ? (
        <textarea
          id={inputId}
          rows={rows}
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          required={required}
          className={error ? "border-red-500 ring-1 ring-red-500" : ""}
          {...rest}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          required={required}
          className={error ? "border-red-500 ring-1 ring-red-500" : ""}
          {...rest}
        />
      )}
      {error && <span className="text-xs text-red-500 font-normal mt-0.5">{error}</span>}
    </label>
  );
}

export default Input;
