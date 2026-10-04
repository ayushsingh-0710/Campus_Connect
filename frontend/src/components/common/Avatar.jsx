import React, { useState } from "react";

export function Avatar({ src, name = "", size = "md", className = "" }) {
  const [imageError, setImageError] = useState(false);

  // Compute initials fallback
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CC";

  if (!src || imageError) {
    return (
      <div
        className={`avatar avatar-${size} flex items-center justify-center font-bold text-slate-700 bg-slate-200 select-none ${className}`.trim()}
        aria-label={`${name} profile`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      className={`avatar avatar-${size} ${className}`.trim()}
      src={src}
      alt={`${name} profile`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
}

export default Avatar;
